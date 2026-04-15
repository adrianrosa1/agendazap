import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { company: true }
        });

        // In a real app, use bcrypt to check password
        if (user && credentials.password === "demo123") {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            companyId: user.companyId,
            companySlug: user.company?.slug
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id;
        session.user.companyId = token.companyId;
        session.user.companySlug = token.companySlug;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.companyId = user.companyId;
        token.companySlug = user.companySlug;
      }
      return token;
    }
  },
  pages: {
    signIn: '/login',
  }
});

export { handler as GET, handler as POST };
