"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, Loader2, History, FilePlus } from 'lucide-react';
import HistoryItemCard from "@/app/components/HistoryItemCard";
import EmptyState from "@/app/components/EmptyState"; // Import the new component

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data.reverse());
        }
      } catch (e) {
        console.error("Failed to fetch history", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredHistory = useMemo(() => {
    return history
      .filter(item => {
        if (filter === 'fake') return item.result.isLikelyFake;
        if (filter === 'authentic') return !item.result.isLikelyFake;
        return true;
      })
      .filter(item => {
        if (!searchTerm) return true;
        const value = item.inputValue?.toLowerCase() || "";
        const analysis = item.result.analysis?.toLowerCase() || "";
        return value.includes(searchTerm.toLowerCase()) || analysis.includes(searchTerm.toLowerCase());
      });
  }, [history, searchTerm, filter]);

  return (
    <div className="relative min-h-screen text-foreground">
        <main className="container mx-auto px-4 py-8 relative z-10">
            <motion.div 
                className="relative max-w-7xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                     <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white drop-shadow-lg">Analysis History</h1>
                    </div>
                    <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-neutral/20 hover:bg-gray-100 dark:hover:bg-neutral/30 rounded-lg transition-colors border border-gray-200 dark:border-white/20">
                        <Home size={16} />
                        Back to Analyzer
                    </Link>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-8 p-4 rounded-2xl bg-white/60 dark:bg-black/20 border border-gray-200 dark:border-transparent">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/50" size={18}/>
                        <input 
                            type="text"
                            placeholder="Search in history..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-white/10 border border-gray-300 dark:border-gray-400/30 text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-300/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="flex items-center gap-2 p-1 rounded-lg bg-gray-200/50 dark:bg-white/10">
                        <FilterButton label="All" filter={filter} setFilter={setFilter} value="all" />
                        <FilterButton label="Likely Fake" filter={filter} setFilter={setFilter} value="fake" />
                        <FilterButton label="Likely Authentic" filter={filter} setFilter={setFilter} value="authentic" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20"><Loader2 className="animate-spin h-10 w-10 text-primary"/></div>
                ) : (
                    <>
                        {filteredHistory.length > 0 ? (
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredHistory.map((item) => (
                                    <HistoryItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-10">
                                <EmptyState
                                    icon={History}
                                    title="No History Found"
                                    description={searchTerm || filter !== 'all' ? "No entries match your current search and filter." : "Your analysis history is empty. Start by analyzing an article!"}
                                >
                                    <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors">
                                        <FilePlus size={16} />
                                        Analyze First Article
                                    </Link>
                                </EmptyState>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </main>
    </div>
  );
}

const FilterButton = ({ label, filter, setFilter, value }) => {
    const isActive = filter === value;
    return (
        <button 
            onClick={() => setFilter(value)}
            className={`px-4 py-1.5 text-sm rounded-md transition-colors font-medium ${isActive ? 'bg-primary text-white' : 'text-gray-600 dark:text-white/70 hover:bg-white/50 dark:hover:bg-white/20'}`}
        >
            {label}
        </button>
    )
}