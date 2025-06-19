"use client";

import { useEffect, useRef } from 'react';
import { motion, useInView, animate } from "framer-motion";

/**
 * A component that animates a number counting up.
 */
function AnimatedNumber({ to }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            const controls = animate(0, to, {
                duration: 1.5,
                ease: "easeOut",
                onUpdate(value) {
                    // Check if ref.current exists before updating
                    if (ref.current) {
                        if (Number.isInteger(to)) {
                            ref.current.textContent = Math.round(value).toLocaleString();
                        } else {
                            ref.current.textContent = value.toFixed(1);
                        }
                    }
                }
            });
            return () => controls.stop();
        }
    }, [isInView, to]);

    const suffix = typeof to === 'string' && to.includes('%') ? '%' : '';
    
    return <span ref={ref}>{Number.isInteger(to) ? to : to.toFixed(1)}{suffix}</span>;
}


export default function StatCard({ icon, label, value, colorClass }) {
    const numericValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
    const isPercentage = typeof value === 'string' && value.includes('%');

    return (
        <motion.div 
            className="p-6 rounded-2xl bg-white dark:bg-neutral/10 border border-gray-200 dark:border-white/20 flex items-center gap-4"
            whileHover={{ scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)" }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            <div className={`p-3 rounded-lg ${colorClass}/20`}>
                {icon}
            </div>
            <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    <AnimatedNumber to={numericValue} />
                    {isPercentage && '%'}
                </p>
                <p className="text-sm text-gray-600 dark:text-white/60">{label}</p>
            </div>
        </motion.div>
    )
}