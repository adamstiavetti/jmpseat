drop policy if exists "Authenticated users can read active approved email domains"
on public.approved_email_domains;

create policy "Authenticated users can read active approved email domains"
on public.approved_email_domains
for select
to authenticated
using (status = 'active');
