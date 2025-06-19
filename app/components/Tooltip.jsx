"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tooltip({ children, content }) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs z-50"
                    >
                        <div className="p-2.5 text-xs text-center text-white bg-gray-800 rounded-md shadow-lg">
                            {content}
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800 -mb-1"></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}