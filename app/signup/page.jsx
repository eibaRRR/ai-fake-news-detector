"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { signIn } from 'next-auth/react';

// 1. Importer les icônes (C'est ce que vous avez fait, c'est parfait !)
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 relative backdrop-blur-2xl bg-white/5 rounded-2xl shadow-2xl border border-white/10">
        <div className="text-center">
            <UserPlus className="mx-auto h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-white mt-2">Create Account</h1>
            <p className="text-white/70">Get started with your free account.</p>
        </div>

        <div className="space-y-4">
            <button
                onClick={() => signIn('google', { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-white/90 text-gray-800 hover:bg-white transition-colors shadow-sm"
            >
                <FcGoogle size={20} /> {/* <-- AJOUT DE L'ICÔNE GOOGLE ICI */}
                <span className="text-sm font-medium">Sign up with Google</span>
            </button>
            <button
                onClick={() => signIn('github', { callbackUrl: '/' })}
                className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-900 transition-colors shadow-sm"
            >
                <FaGithub size={20} /> {/* <-- AJOUT DE L'ICÔNE GITHUB ICI */}
                <span className="text-sm font-medium">Sign up with GitHub</span>
            </button>
        </div>

        <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="flex-shrink mx-4 text-xs text-white/50">OR</span>
            <div className="flex-grow border-t border-white/20"></div>
        </div>

        {error && ( <div className="p-3 text-center text-sm rounded-md bg-danger/20 text-danger-text border border-danger/30">{error}</div> )}
        {success && ( <div className="p-3 text-center text-sm rounded-md bg-success/20 text-success-text border border-success/30">{success}</div> )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/80">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400/30 text-white"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400/30 text-white"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg bg-white/10 border border-gray-400/30 text-white"/>
          </div>
          <button type="submit" disabled={isLoading} className="w-full px-5 py-2.5 bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors disabled:opacity-50">
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
         <p className="text-sm text-center text-white/60">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login
            </Link>
          </p>
      </div>
    </div>
  );
}