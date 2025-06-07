"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { User, KeyRound, ShieldAlert, Home, Loader2 } from "lucide-react";
import ChangePasswordForm from "@/app/components/ChangePasswordForm";
import ConfirmationModal from "@/app/components/ConfirmationModal";

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [error, setError] = useState('');

    if (status === "unauthenticated") {
        router.replace("/login");
        return null;
    }

    if (status === "loading") {
        return (
          <div className="flex justify-center items-center min-h-screen">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        );
    }
    
    const handleConfirmDelete = async () => {
        try {
            const res = await fetch('/api/user', { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete account.");
            setIsDeleteModalOpen(false);
            await signOut({ callbackUrl: '/' });
        } catch (err) {
            setError(err.message);
            setIsDeleteModalOpen(false);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-transparent text-foreground">
                <main className="container mx-auto px-4 py-8">
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <div className="flex items-center gap-3">
                            <User size={32} className="text-primary" />
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">User Profile</h1>
                        </div>
                        <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral/20 hover:bg-neutral/30 text-gray-800 dark:text-white rounded-lg transition-colors">
                            <Home size={16} />
                            Back to Analyzer
                        </Link>
                    </div>

                    {error && <div className="p-4 mb-6 text-center rounded-md bg-danger/20 text-danger-text border border-danger/30">{error}</div>}

                    <div className="max-w-2xl mx-auto">
                        <div className="p-6 rounded-2xl bg-white dark:bg-neutral/10 border border-gray-200 dark:border-white/20 mb-6">
                            <h3 className="font-semibold text-gray-800 dark:text-white/90 mb-1">Account Information</h3>
                            <p className="text-sm text-gray-600 dark:text-white/70">
                                <span className="font-medium">Name:</span> {session.user.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-white/70">
                                <span className="font-medium">Email:</span> {session.user.email}
                            </p>
                        </div>

                        <ChangePasswordForm />

                        <div className="p-6 rounded-2xl bg-danger/10 border border-danger/30 mt-6">
                            <h3 className="font-semibold text-danger-text flex items-center gap-2"><ShieldAlert size={20}/> Danger Zone</h3>
                            <p className="text-sm text-gray-600 dark:text-white/70 mt-2 mb-4">Permanently delete your account and all associated data, including your analysis history. This action cannot be undone.</p>
                            <button onClick={() => setIsDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-danger/80 hover:bg-danger text-white rounded-lg">
                                Delete My Account
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Account"
            >
                Are you sure you want to permanently delete your account and all your data? This action cannot be undone.
            </ConfirmationModal>
        </>
    );
}