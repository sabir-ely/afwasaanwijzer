import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyUser, initDb } from "@/lib/db";
import { SessionUser } from "@/lib/types";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;
        initDb();
        return verifyUser(credentials.username, credentials.password);
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as SessionUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as SessionUser).role = (token as SessionUser).role;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
