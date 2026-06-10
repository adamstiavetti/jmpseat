create or replace function public.operator_scope_values()
returns text[]
language sql
immutable
as $$
  select array[
    'operator.internal_private_app_access',
    'operator.read_audit',
    'operator.view_waitlist_contacts',
    'operator.community_moderation',
    'operator.manage_approved_domains',
    'operator.manage_reviewer_scopes',
    'operator.read_verification_requests',
    'operator.monitor_proof_cleanup',
    'operator.run_proof_cleanup',
    'operator.manage_operator_access',
    'operator.manage_beta_invites'
  ]::text[];
$$;

create table public.board_post_reports (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.board_posts (id) on delete cascade,
  reporter_user_id uuid not null references auth.users (id) on delete cascade,
  reason text not null,
  details text,
  status text not null default 'open',
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users (id),
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_post_reports_reason_check check (
    reason in ('spam', 'harassment', 'unsafe_info', 'privacy', 'off_topic', 'other')
  ),
  constraint board_post_reports_status_check check (
    status in ('open', 'reviewing', 'resolved', 'dismissed')
  ),
  constraint board_post_reports_details_length_check check (
    details is null or char_length(details) <= 1000
  ),
  constraint board_post_reports_resolution_note_length_check check (
    resolution_note is null or char_length(resolution_note) <= 1000
  ),
  constraint board_post_reports_reviewed_state_check check (
    (status in ('open', 'reviewing') and reviewed_at is null)
    or status in ('resolved', 'dismissed')
  )
);

create unique index board_post_reports_one_open_report_per_reporter_post_idx
on public.board_post_reports (post_id, reporter_user_id)
where status in ('open', 'reviewing');

create index board_post_reports_post_status_created_at_idx
on public.board_post_reports (post_id, status, created_at desc);

create index board_post_reports_reporter_created_at_idx
on public.board_post_reports (reporter_user_id, created_at desc);

create or replace function public.set_board_post_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_board_post_reports_updated_at
before update on public.board_post_reports
for each row
execute function public.set_board_post_reports_updated_at();

alter table public.board_post_reports enable row level security;

revoke all on table public.board_post_reports from anon, authenticated;
grant select, insert, update on table public.board_post_reports to service_role;

create or replace function public.report_open_baseboard_post(
  p_base_code text,
  p_post_id uuid,
  p_reason text,
  p_details text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_reason text := lower(trim(coalesce(p_reason, '')));
  v_details text := nullif(trim(coalesce(p_details, '')), '');
  v_base_id uuid;
  v_board_id uuid;
  v_report_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.current_user_can_read_open_board_posts() then
    raise exception 'Read eligibility required'
      using errcode = '42501';
  end if;

  if p_post_id is null then
    raise exception 'Post is required'
      using errcode = '22023';
  end if;

  if v_reason not in ('spam', 'harassment', 'unsafe_info', 'privacy', 'off_topic', 'other') then
    raise exception 'Unsupported report reason'
      using errcode = '22023';
  end if;

  if v_details is not null and char_length(v_details) > 1000 then
    raise exception 'Report details are too long'
      using errcode = '22023';
  end if;

  select bases.id
  into v_base_id
  from public.bases
  where bases.code = v_base_code
    and bases.status = 'active'
  limit 1;

  if v_base_id is null then
    raise exception 'Active base not found'
      using errcode = 'P0002';
  end if;

  select boards.id
  into v_board_id
  from public.boards
  inner join public.board_types
    on board_types.id = boards.board_type_id
  where boards.base_id = v_base_id
    and boards.status = 'active'
    and boards.visibility = 'open_verified'
    and board_types.key = 'base_board'
    and board_types.is_active = true
  order by boards.sort_order, boards.created_at
  limit 1;

  if v_board_id is null then
    raise exception 'Active open verified base board not found'
      using errcode = 'P0002';
  end if;

  perform 1
  from public.board_posts
  where board_posts.id = p_post_id
    and board_posts.board_id = v_board_id
    and board_posts.status = 'published'
    and board_posts.visibility = 'board';

  if not found then
    raise exception 'Published board post not found'
      using errcode = 'P0002';
  end if;

  select board_post_reports.id
  into v_report_id
  from public.board_post_reports
  where board_post_reports.post_id = p_post_id
    and board_post_reports.reporter_user_id = v_user_id
    and board_post_reports.status in ('open', 'reviewing')
  order by board_post_reports.created_at desc
  limit 1;

  if v_report_id is not null then
    return v_report_id;
  end if;

  insert into public.board_post_reports (
    post_id,
    reporter_user_id,
    reason,
    details
  )
  values (
    p_post_id,
    v_user_id,
    v_reason,
    v_details
  )
  returning id into v_report_id;

  return v_report_id;
end;
$$;

create or replace function public.moderate_open_baseboard_post(
  p_base_code text,
  p_post_id uuid,
  p_action text,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_base_code text := coalesce(upper(trim(p_base_code)), '');
  v_action text := lower(trim(coalesce(p_action, '')));
  v_reason text := trim(coalesce(p_reason, ''));
  v_base_id uuid;
  v_board_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '28000';
  end if;

  if not public.is_operator_with_scope('operator.community_moderation') then
    raise exception 'Operator moderation scope required'
      using errcode = '42501';
  end if;

  if p_post_id is null then
    raise exception 'Post is required'
      using errcode = '22023';
  end if;

  if v_action not in ('hide', 'remove') then
    raise exception 'Unsupported moderation action'
      using errcode = '22023';
  end if;

  if char_length(v_reason) = 0 then
    raise exception 'Moderation reason is required'
      using errcode = '22023';
  end if;

  if char_length(v_reason) > 1000 then
    raise exception 'Moderation reason is too long'
      using errcode = '22023';
  end if;

  select bases.id
  into v_base_id
  from public.bases
  where bases.code = v_base_code
    and bases.status = 'active'
  limit 1;

  if v_base_id is null then
    raise exception 'Active base not found'
      using errcode = 'P0002';
  end if;

  select boards.id
  into v_board_id
  from public.boards
  inner join public.board_types
    on board_types.id = boards.board_type_id
  where boards.base_id = v_base_id
    and boards.status = 'active'
    and boards.visibility = 'open_verified'
    and board_types.key = 'base_board'
    and board_types.is_active = true
  order by boards.sort_order, boards.created_at
  limit 1;

  if v_board_id is null then
    raise exception 'Active open verified base board not found'
      using errcode = 'P0002';
  end if;

  update public.board_posts
  set
    status = case when v_action = 'hide' then 'hidden' else 'removed' end,
    removed_at = now(),
    removed_by = v_user_id,
    removal_reason = v_reason
  where board_posts.id = p_post_id
    and board_posts.board_id = v_board_id;

  if not found then
    raise exception 'Board post not found'
      using errcode = 'P0002';
  end if;

  return p_post_id;
end;
$$;

revoke all on function public.report_open_baseboard_post(text, uuid, text, text) from public;
revoke execute on function public.report_open_baseboard_post(text, uuid, text, text) from anon;
grant execute on function public.report_open_baseboard_post(text, uuid, text, text) to authenticated;
grant execute on function public.report_open_baseboard_post(text, uuid, text, text) to service_role;

revoke all on function public.moderate_open_baseboard_post(text, uuid, text, text) from public;
revoke execute on function public.moderate_open_baseboard_post(text, uuid, text, text) from anon;
grant execute on function public.moderate_open_baseboard_post(text, uuid, text, text) to authenticated;
grant execute on function public.moderate_open_baseboard_post(text, uuid, text, text) to service_role;

comment on table public.board_post_reports is 'Minimal board post report table for DFW/Baseboard safety. Reporter identity and report details are not publicly exposed; user submission and operator review paths must use scoped RPC/server code.';
comment on column public.board_post_reports.reporter_user_id is 'Authenticated reporter forced by report_open_baseboard_post via auth.uid(); not user supplied and not broadly exposed.';
comment on function public.report_open_baseboard_post(text, uuid, text, text) is 'Reports a published board-visible post on an active open verified Baseboard by active base code. Requires DB-level open board read eligibility, returns only the report UUID, and does not expose reporter identity, author ids, emails, verification data, proof storage data, signed URLs, or private paths.';
comment on function public.moderate_open_baseboard_post(text, uuid, text, text) is 'Operator-scoped hide/remove RPC for active open verified Baseboard posts. Requires operator.community_moderation, updates board_posts lifecycle fields, returns only the post UUID, and does not implement account penalties, automated review decisions, comments, saves, reactions, search, or proof-upload scope.';
