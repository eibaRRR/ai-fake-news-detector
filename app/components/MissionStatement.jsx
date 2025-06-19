import { motion } from "framer-motion";
import { Landmark, HeartPulse, MessageCircle } from "lucide-react";

const points = [
    {
        icon: Landmark,
        title: "Uphold Democracy",
        description: "Informed citizens are the bedrock of a healthy democracy. We help you verify information to make sound decisions."
    },
    {
        icon: HeartPulse,
        title: "Promote Public Health & Safety",
        description: "Misinformation can have serious consequences. Our tool helps you identify false claims about critical health and safety topics."
    },
    {
        icon: MessageCircle,
        title: "Foster Informed Dialogue",
        description: "By filtering out the noise, we aim to elevate public discourse and encourage conversations based on verified facts."
    }
];

export default function MissionStatement() {
    return (
        <div className="mt-20 text-center max-w-4xl mx-auto">
            <motion.h2 
                className="text-3xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
            >
                Why It Matters
            </motion.h2>
            <motion.p 
                className="text-lg text-white/70 mb-12 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                In an age of information overload, distinguishing fact from fiction is more critical than ever. Our mission is to provide you with the tools to critically evaluate information and foster a more informed public.
            </motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {points.map((point, i) => (
                    <motion.div
                        key={point.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        transition={{ duration: 0.5, delay: 0.2 + (i * 0.1) }}
                        className="text-left p-6 rounded-2xl bg-white/5 border border-white/10"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <point.icon className="w-6 h-6 text-primary" />
                            <h3 className="font-semibold text-white/90 text-lg">{point.title}</h3>
                        </div>
                        <p className="text-sm text-white/60">{point.description}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}