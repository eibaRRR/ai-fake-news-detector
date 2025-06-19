"use client";

import React from 'react'; // Add this import
import { motion } from 'framer-motion';
import { UploadCloud, Cpu, FileCheck2, MoveRight } from 'lucide-react';

const steps = [
    {
        icon: UploadCloud,
        title: "1. Submit Content",
        description: "Provide a news article by uploading a screenshot, entering a URL, or pasting the text directly."
    },
    {
        icon: Cpu,
        title: "2. AI Analysis",
        description: "Our advanced AI model processes the content, identifying key claims, detecting bias, and analyzing the emotional tone."
    },
    {
        icon: FileCheck2,
        title: "3. Get Results",
        description: "Receive a comprehensive report with a confidence score, verification sources, and a full breakdown."
    }
];

export default function HowItWorks() {
    return (
        <div className="mt-16 mb-20">
            <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="text-3xl font-bold text-white">How It Works</h2>
                <p className="text-lg text-white/70 mt-2">Get your analysis in three simple steps.</p>
            </motion.div>

            <motion.div 
                className="mt-12 grid grid-cols-1 md:grid-cols-5 items-center gap-6"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                transition={{ staggerChildren: 0.2 }}
            >
                {steps.map((step, index) => (
                    <React.Fragment key={step.title}>
                        <motion.div 
                            className="p-6 rounded-2xl bg-neutral/10 border border-white/20 text-center col-span-1 md:col-span-1"
                            variants={{
                                hidden: { opacity: 0, scale: 0.9 },
                                visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
                            }}
                        >
                            <div className="inline-block p-3 rounded-full bg-primary/20 mb-4 border border-primary/30">
                                <step.icon className="w-7 h-7 text-primary" />
                            </div>
                            <h3 className="font-semibold text-white/90">{step.title}</h3>
                            <p className="text-sm text-white/60 mt-1">{step.description}</p>
                        </motion.div>

                        {index < steps.length - 1 && (
                            <motion.div 
                                className="hidden md:block text-center"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: { opacity: 1, transition: { delay: 0.2, duration: 0.4 } }
                                }}
                            >
                                <MoveRight className="w-8 h-8 text-white/40 mx-auto" />
                            </motion.div>
                        )}
                    </React.Fragment>
                ))}
            </motion.div>
        </div>
    );
}