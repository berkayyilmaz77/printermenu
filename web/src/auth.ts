import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Admin paneli girişi — tek, ortak bir şifreyle korunuyor (kullanıcı adı/email
// yok). Şifre .env.local'deki ADMIN_PASSWORD ile karşılaştırılıyor, eşleşirse
// sabit bir "admin" kullanıcısı için JWT session açılıyor. Bunu Vercel'e
// deploy ederken ADMIN_PASSWORD env var'ı proje ayarlarına da eklenmeli.
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        password: { label: "Şifre", type: "password" },
      },
      authorize: async (credentials) => {
        const password = credentials?.password;
        const adminPassword = process.env.ADMIN_PASSWORD;
        if (typeof password !== "string" || !adminPassword) return null;
        if (password !== adminPassword) return null;

        return { id: "admin", name: "Admin", role: "owner" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
  },
});
