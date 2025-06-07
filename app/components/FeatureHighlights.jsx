import { motion } from "framer-motion";
import { Scan, Scale, Rss, Puzzle } from "lucide-react";

const featureList = [
    {
        icon: Scan,
        title: "Analyze from Any Source",
        description: "Upload images, paste article text, or enter a URL. Our AI handles the rest, extracting and analyzing the content for you."
    },
    {
        icon: Scale,
        title: "Go Beyond True/False",
        description: "Get a detailed breakdown including a confidence score, analysis of potential bias, and the overall tone of the article."
    },
    {
        icon: Rss,
        title: "Stay Updated with a Live Feed",
        description: "Monitor top headlines in real-time. Our system automatically fetches and analyzes the latest news as it breaks."
    },
    {
        icon: Puzzle,
        title: "Test Your Skills with a Quiz",
        description: "Challenge yourself with our AI-generated quiz to see if you can distinguish between real and fabricated news headlines."
    }
];

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

export default function FeatureHighlights() {
    return (
        <div className="mt-16 text-center">
            <motion.h2 
                className="text-3xl font-bold text-white mb-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                Comprehensive Analysis Tools
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featureList.map((feature, i) => (
                    <motion.div
                        key={feature.title}
                        custom={i}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-xl backdrop-blur-xl flex flex-col items-center"
                    >
                        <div className="p-3 rounded-full bg-primary/20 mb-4 border border-primary/30">
                            <feature.icon className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                        <p className="text-sm text-white/70 leading-relaxed">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}