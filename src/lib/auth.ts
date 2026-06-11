import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { organisation: true },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.motDePasse
        );

        if (!passwordMatch) return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.nom,
          role: user.role,
          organisationId: user.organisationId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.organisationId = user.organisationId;
      }
      return token;
    },
  async session({ session, token }) {
  if (token) {
    session.user.role = token.role as string;
    session.user.organisationId = token.organisationId as number;
    session.user.id = token.sub ?? "";
  }
  return session;
},
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});