"use client";

import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';
import { LogIn, LogOut, LayoutDashboard, User, Shield } from "lucide-react"; // 1. Import the Shield icon

export default function AuthStatus() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-24 h-7 bg-gray-200 dark:bg-neutral/20 rounded-full animate-pulse"></div>;
  }

  if (session) {
    return (
      <div className="flex items-center gap-2">
        {/* 2. Conditionally render the Admin link for admin users */}
        {session.user?.role === 'admin' && (
            <Link href="/admin" className="p-1.5 bg-primary/20 dark:bg-primary/30 hover:bg-primary/30 dark:hover:bg-primary/50 text-primary dark:text-white rounded-full transition-colors" title="Admin Dashboard">
                <Shield size={14} />
            </Link>
        )}
        <Link href="/profile" className="p-1.5 bg-gray-200/80 dark:bg-neutral/30 hover:bg-gray-300 dark:hover:bg-neutral/50 text-gray-700 dark:text-white rounded-full transition-colors" title="Profile">
            <User size={14} />
        </Link>
        <Link href="/dashboard" className="p-1.5 bg-gray-200/80 dark:bg-neutral/30 hover:bg-gray-300 dark:hover:bg-neutral/50 text-gray-700 dark:text-white rounded-full transition-colors" title="Dashboard">
            <LayoutDashboard size={14} />
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-danger/80 hover:bg-danger text-white rounded-full transition-colors"
          title="Sign Out"
        >
          <LogOut size={14} />
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors"
    >
      <LogIn size={14} />
      <span>Login / Sign Up</span>
    </Link>
  );
}