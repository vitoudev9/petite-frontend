import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          if (!res.ok) return null;

          const data = await res.json();

          // All custom fields are added here — the User interface is
          // augmented in types/next-auth.d.ts so TypeScript knows about them
          return {
            id:           String(data.user.id),
            name:         data.user.full_name,
            username:     data.user.username,
            role:         data.user.role,
            status:       data.user.status,
            staff_id:     data.user.staff_id ?? null,
            accessToken:  data.access_token,
            refreshToken: data.refresh_token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      // user is only populated on first sign-in
      if (user) {
        token.accessToken  = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role         = user.role;
        token.status       = user.status;
        token.staff_id     = user.staff_id;
        token.userId       = user.id;
        token.username     = user.username;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken      = token.accessToken;
      session.refreshToken     = token.refreshToken;
      session.user.userId      = token.userId;
      session.user.username    = token.username;
      session.user.role        = token.role;
      session.user.status      = token.status;
      session.user.staff_id    = token.staff_id;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge:   7 * 24 * 60 * 60, // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET ?? "change-me-in-production",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };