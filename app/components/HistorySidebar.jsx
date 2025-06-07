"use client";

import Link from 'next/link';
import { useSession } from "next-auth/react";
import { FileImage, FileText, Trash2, History, Rss, Puzzle } from 'lucide-react';

export default function HistorySidebar({ history, onHistoryClick, onClearHistory }) {
    const { data: session } = useSession();

    return (
        <div className="absolute top-0 -left-64 w-60 h-full p-4 hidden lg:block">
            <div className="h-full rounded-2xl p-4 backdrop-blur-lg bg-white/10 border border-white/20 flex flex-col">
                {/* This section is now always visible */}
                <h3 className="font-semibold text-white/90 mb-4">Explore More</h3>
                <ul className="space-y-2">
                    <li>
                        <Link href="/live" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <Rss className="w-5 h-5 text-primary" />
                            <span className="text-sm text-white/80">Live News Feed</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/quiz" className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <Puzzle className="w-5 h-5 text-primary" />
                            <span className="text-sm text-white/80">News Quiz</span>
                        </Link>
                    </li>
                </ul>

                {/* This section is only for logged-in users */}
                {session && (
                    <div className="mt-6 pt-6 border-t border-white/20 flex flex-col flex-grow h-0">
                        {(!history || history.length === 0) ? (
                            <div className="flex flex-col items-center justify-center text-center text-white/60 flex-grow">
                                <History size={32} className="mb-4"/>
                                <h3 className="font-semibold text-white/90">History</h3>
                                <p className="text-sm mt-2">Your analyses will appear here.</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold text-white/90">History</h3>
                                    <button onClick={onClearHistory} title="Clear History" className="p-1 text-white/60 hover:text-white transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <ul className="space-y-2 flex-grow overflow-y-auto pr-2">
                                    {history.map((item) => (
                                        <li key={item.id}>
                                            <button 
                                                onClick={() => onHistoryClick(item.id)}
                                                className="w-full text-left p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {item.inputType === 'image' 
                                                        ? <FileImage className="text-white/70" size={16}/> 
                                                        : <FileText className="text-white/70" size={16}/>
                                                    }
                                                    <span className="flex-1 text-sm text-white/80 truncate">
                                                        {item.inputType === 'image' ? 'Image Analysis' : item.inputValue}
                                                    </span>
                                                    <span className={`text-xs font-bold ${item.result.isLikelyFake ? 'text-danger-text' : 'text-success-text'}`}>
                                                        {item.result.isLikelyFake ? 'Fake' : 'Auth.'}
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-auto pt-4 border-t border-white/20">
                                    <Link href="/history" className="block w-full text-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white/80 transition-colors">
                                        View All History
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Show a login prompt if not logged in */}
                {!session && (
                    <div className="mt-auto pt-4 border-t border-white/20 text-center">
                        <p className="text-xs text-white/60">
                            <Link href="/login" className="font-semibold text-white/90 hover:underline">Log in</Link> to save your analysis history.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
