import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  
  // --- STRATEGY CHANGE ---
  // We are changing the session strategy to "jwt"
  session: {
    strategy: "jwt",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'Credentials',
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
            return null;
        }
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection('users').findOne({ email: credentials.email });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          return null;
        }

        // Return the user object with the role
        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },

  // --- NEW CALLBACKS FOR JWT STRATEGY ---
  callbacks: {
    // This callback runs when a JWT is created.
    async jwt({ token, user }) {
      // On initial sign in, add the user's role to the token
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },

    // This callback runs when a session is accessed.
    async session({ session, token }) {
      // Add the role from the token to the session object
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    }
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };