import Link from 'next/link';
import { BarChart4, Twitter, Github, Linkedin, MessageCircle } from 'lucide-react'; // 1. Import the MessageCircle icon

export default function Footer() {
    return (
        <footer className="relative mt-20 border-t border-white/10 bg-black/20 backdrop-blur-lg">
            <div className="container mx-auto px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Brand */}
                    <div className="flex flex-col items-start">
                         <Link href="/" className="flex items-center gap-2 mb-4">
                            <BarChart4 size={24} className="text-primary" />
                            <span className="font-bold text-lg text-white">AI Fake News Detector</span>
                        </Link>
                        <p className="text-sm text-white/60">
                            An intelligent tool for analyzing news articles and images to combat the spread of misinformation.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h4 className="font-semibold text-white/90 mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li><Link href="/live" className="text-sm text-white/60 hover:text-white transition-colors">Live Feed</Link></li>
                            <li><Link href="/quiz" className="text-sm text-white/60 hover:text-white transition-colors">News Quiz</Link></li>
                            <li><Link href="/history" className="text-sm text-white/60 hover:text-white transition-colors">Full History</Link></li>
                            <li><Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Legal */}
                    <div>
                        <h4 className="font-semibold text-white/90 mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-sm text-white/60 hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Connect & Feedback */}
                     <div>
                        <h4 className="font-semibold text-white/90 mb-4">Connect With Us</h4>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-white/60 hover:text-primary transition-colors"><Twitter size={20} /></a>
                            <a href="#" className="text-white/60 hover:text-primary transition-colors"><Github size={20} /></a>
                            <a href="#" className="text-white/60 hover:text-primary transition-colors"><Linkedin size={20} /></a>
                        </div>
                        
                        {/* --- 2. This is the new Feedback section --- */}
                        <div className="mt-6">
                            <h4 className="font-semibold text-white/90 mb-3">Application Feedback</h4>
                            <a 
                                href="https://docs.google.com/forms/d/e/1FAIpQLSeiDWN2iRuXCY8LZId1BQlQt8OUuSe9J7-CYez7hlxzG97alA/viewform?usp=dialog" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-primary transition-colors"
                            >
                                <MessageCircle size={16} />
                                Give your opinion
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-white/50">
                    <p>&copy; {new Date().getFullYear()} AI Fake News Detector. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}