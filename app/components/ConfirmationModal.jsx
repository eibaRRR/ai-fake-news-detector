"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, children }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal Panel */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="relative w-full max-w-md p-6 rounded-2xl bg-neutral/20 border border-white/20 shadow-2xl"
                >
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-danger/20">
                            <AlertTriangle className="w-6 h-6 text-danger-text" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{title}</h3>
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-white/70">
                        {children}
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2 text-sm font-medium text-white/80 bg-neutral/20 hover:bg-neutral/30 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={onConfirm} 
                            className="px-4 py-2 text-sm font-medium text-white bg-danger/80 hover:bg-danger rounded-lg transition-colors"
                        >
                            Yes, Delete Account
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
  );
}