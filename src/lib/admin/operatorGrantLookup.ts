export type AuthAdminListUsersPage = {
  id?: string | null;
  email?: string | null;
};

export type AuthAdminListUsersResult = {
  data: {
    users?: AuthAdminListUsersPage[] | null;
  };
  error: unknown;
};

export type AuthAdminListUsersLoader = (input: {
  page: number;
  perPage: number;
}) => Promise<AuthAdminListUsersResult>;

export async function findAuthUserIdByEmailAcrossPages(input: {
  targetEmail: string;
  listUsersPage: AuthAdminListUsersLoader;
}) {
  const perPage = 200;

  for (let page = 1; ; page += 1) {
    const result = await input.listUsersPage({
      page,
      perPage,
    });

    if (result.error) {
      throw new Error("Target user lookup failed.");
    }

    const users = result.data.users ?? [];
    const match = users.find(
      (user) => user.email?.trim().toLowerCase() === input.targetEmail,
    );

    if (match?.id) {
      return match.id;
    }

    if (users.length === 0 || users.length < perPage) {
      return null;
    }
  }
}
