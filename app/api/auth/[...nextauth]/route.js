import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import clientPromise from '@/lib/mongodb'; // <-- Import the new helper
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        console.log("\n[NextAuth] Authorize function started...");
        
        if (!credentials?.email || !credentials?.password) {
            console.log("[NextAuth] Missing email or password.");
            return null;
        }

        try {
            const client = await clientPromise;
            const db = client.db();
            
            console.log(`[NextAuth] Searching for user with email: ${credentials.email}`);
            const user = await db.collection('users').findOne({ email: credentials.email });
    
            if (!user) {
                console.log("[NextAuth] User not found in database.");
                return null; 
            }
            console.log("[NextAuth] User found in database:", user.email);
            
            console.log("[NextAuth] Comparing passwords...");
            const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
    
            if (!isPasswordCorrect) {
                console.log("[NextAuth] Password comparison failed. Incorrect password.");
                return null;
            }
    
            console.log("[NextAuth] Password is correct. Login successful.");
            return {
                id: user._id.toString(),
                name: user.name,
                email: user.email,
            };
        } catch (error) {
            console.error("[NextAuth] Error during authorization:", error);
            return null;
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };