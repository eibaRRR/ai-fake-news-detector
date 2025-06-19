"use client";

import { motion } from 'framer-motion';

export default function EmptyState({ icon, title, description, children }) {
    const Icon = icon;
    return (
        <motion.div 
            className="text-center p-8 rounded-2xl bg-gray-100 dark:bg-neutral/10 border-2 border-dashed border-gray-300 dark:border-white/20"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
                <Icon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-gray-800 dark:text-white/90">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-white/60 mt-1">{description}</p>
            {children && <div className="mt-6">{children}</div>}
        </motion.div>
    );
}