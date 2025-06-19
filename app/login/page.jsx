"use client";

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

// 1. Importer les icônes
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      setIsLoading(false);

      if (res.error) {
        setError('Login Failed. Please check your email and password.');
        return;
      }

      if (res.ok) {
        router.replace('/');
      }

    } catch (err) {
      setIsLoading(false);
      setError('An unexpected error occurred.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 relative backdrop-blur-2xl bg-white/5 rounded-2xl shadow-2xl border border-white/10">
        <div className="text-center">
            <LogIn className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-white mt-2">Welcome Back</h1>
            <p className="text-white/70">Sign in to continue.</p>
        </div>
        
        <div className="space-y-4">
            <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-white/90 text-gray-800 hover:bg-white transition-colors shadow-sm"
            >
                {/* 2. Ajouter le composant de l'icône dans le bouton */}
                <FcGoogle size={20} />
                <span className="text-sm font-medium">Login with Google</span>
            </button>
            <button
                onClick={() => signIn('github', { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors shadow-sm"
            >
                <FaGithub size={20} />
                <span className="text-sm font-medium">Login with GitHub</span>
            </button>
        </div>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-4 text-xs text-white/50">OR CONTINUE WITH</span>
            <div className="flex-grow border-t border-white/20"></div>
        </div>
        
        {error && (
            <div className="p-3 text-center text-sm rounded-md bg-danger/20 text-danger-text border border-danger/30">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400/30 text-white placeholder-gray-300/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400/30 text-white placeholder-gray-300/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <button type="submit" disabled={isLoading} className="w-full px-5 py-2.5 bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors disabled:opacity-50">
             {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
         <p className="text-sm text-center text-white/60">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
      </div>
    </div>
  );
}