import Link from 'next/link';
import { motion } from 'framer-motion';
import { Rss, Puzzle, ArrowRight } from 'lucide-react';

export default function CallToAction() {
    return (
        <div className="mt-20 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Live Feed Card */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative p-8 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 overflow-hidden"
                >
                    <div className="relative z-10">
                        <Rss className="w-8 h-8 text-primary mb-3" />
                        <h3 className="text-2xl font-bold text-white mb-2">Explore the Live News Feed</h3>
                        <p className="text-white/70 mb-6">
                            See real-time news headlines as they are automatically fetched and analyzed by our AI.
                        </p>
                        <Link href="/live" className="inline-flex items-center gap-2 font-semibold text-white bg-primary/80 hover:bg-primary px-5 py-2.5 rounded-lg transition-colors">
                            <span>View Live Feed</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </motion.div>

                {/* Quiz Card */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="relative p-8 rounded-2xl bg-neutral/10 border border-white/20"
                >
                     <Puzzle className="w-8 h-8 text-white/80 mb-3" />
                    <h3 className="text-2xl font-bold text-white mb-2">Take the News Quiz</h3>
                    <p className="text-white/70 mb-6">
                        Challenge your ability to spot misinformation with our interactive, AI-generated fake news quiz.
                    </p>
                    <Link href="/quiz" className="inline-flex items-center gap-2 font-semibold text-white bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-lg transition-colors">
                        <span>Start Quiz</span>
                        <ArrowRight size={16} />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}