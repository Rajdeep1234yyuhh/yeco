// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const testUser = {
          id: "1",
          name: "Test User",
          email: "test@example.com",
          password: "1234",
        };

        if (
          credentials?.email === testUser.email &&
          credentials?.password === testUser.password
        ) {
          return {
            id: testUser.id,
            name: testUser.name,
            email: testUser.email,
          };
        }

        return null; // authentication failed
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
