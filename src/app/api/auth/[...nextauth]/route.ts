import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login", // You can change this to your custom sign-in page if needed
  },
  session: {
    strategy: "jwt" as const,
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "QdklurCCRZhrFrkFodnW3K7FwQfsHMBodHeDLALkmgQ=", // Fallback for local testing
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
