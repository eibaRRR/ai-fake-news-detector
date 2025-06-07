"use client";

import { useState } from 'react';
import { KeyRound } from 'lucide-react';

export default function ChangePasswordForm() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('/api/user/change-password', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong.");
            }
            
            setSuccess("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 rounded-2xl bg-neutral/10 border border-white/20 mt-6">
            <h3 className="font-semibold text-white/90 mb-4">Change Password</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-white/80">Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg bg-black/20 border border-gray-400/30 text-white"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80">New Password</label>
                    {/* --- THIS LINE IS CORRECTED --- */}
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg bg-black/20 border border-gray-400/30 text-white"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-white/80">Confirm New Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="mt-1 w-full px-4 py-2 rounded-lg bg-black/20 border border-gray-400/30 text-white"/>
                </div>

                {error && <p className="text-sm text-danger-text">{error}</p>}
                {success && <p className="text-sm text-success-text">{success}</p>}

                <button type="submit" disabled={isLoading} className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 text-sm font-medium bg-primary/80 hover:bg-primary text-white rounded-lg disabled:opacity-50">
                    <KeyRound size={16}/>
                    {isLoading ? "Updating..." : "Update Password"}
                </button>
            </form>
        </div>
    )
}