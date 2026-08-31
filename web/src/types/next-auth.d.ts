import type { DefaultSession } from "next-auth";

// admin_users.role alanını session.user'a ekliyoruz (owner | staff).
declare module "next-auth" {
  interface Session {
    user: {
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
