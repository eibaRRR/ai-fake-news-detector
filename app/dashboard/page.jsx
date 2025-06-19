"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, BarChart, CheckCircle, Target, Home, FileText, FileImage } from "lucide-react";
import StatCard from "@/app/components/StatCard";
import AnalysisDonutChart from "@/app/components/AnalysisDonutChart";
import Link from 'next/link';
import ClientOnlyTimestamp from "@/app/components/ClientOnlyTimestamp";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState(null);
  const [recentHistory, setRecentHistory] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    
    if (status === "authenticated") {
        // We will fetch stats and the full history to show the most recent items
        Promise.all([
            fetch('/api/dashboard-stats'),
            fetch('/api/history')
        ]).then(async ([statsRes, historyRes]) => {
            if (!statsRes.ok || !historyRes.ok) {
                throw new Error("Failed to load dashboard data.");
            }
            const statsData = await statsRes.json();
            const historyData = await historyRes.json();

            if (statsData.error || historyData.error) {
                throw new Error("An error occurred while fetching data.");
            }
            
            setStats(statsData);
            // The history API returns items newest first, so we take the first 5
            setRecentHistory(historyData.slice(0, 5));

        }).catch(err => {
            setError(err.message);
        }).finally(() => {
            setIsLoading(false);
        });
    }
  }, [status, router]);

  if (isLoading || !stats) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-transparent text-foreground">
          <main className="container mx-auto px-4 py-8">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white dark:bg-neutral/20 hover:bg-gray-100 dark:hover:bg-neutral/30 text-gray-800 dark:text-white rounded-lg transition-colors border border-gray-200 dark:border-white/20">
                    <Home size={16} />
                    Back to Analyzer
                </Link>
              </div>
              
              {error && <div className="p-4 mb-6 text-center rounded-md bg-danger/20 text-danger-text border border-danger/30">{error}</div>}
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                <div className="lg:col-span-1 space-y-6">
                    <StatCard icon={<BarChart size={24} className="text-primary"/>} label="Total Analyses" value={stats.totalAnalyses} colorClass="bg-primary"/>
                    <StatCard icon={<CheckCircle size={24} className="text-success-text"/>} label="Likely Authentic" value={stats.authenticCount} colorClass="bg-success"/>
                    <StatCard icon={<AlertTriangle size={24} className="text-danger-text"/>} label="Likely Fake" value={stats.fakeCount} colorClass="bg-danger"/>
                    {(stats.quizAccuracy > 0) && (
                      <StatCard icon={<Target size={24} className="text-yellow-400"/>} label="Quiz Accuracy" value={`${stats.quizAccuracy}%`} colorClass="bg-yellow-400"/>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 rounded-2xl bg-white dark:bg-neutral/10 border border-gray-200 dark:border-white/20">
                      <AnalysisDonutChart authenticCount={stats.authenticCount} fakeCount={stats.fakeCount} />
                    </div>

                    {/* Replaced the chart with a "Recent Activity" list */}
                    <div className="p-6 rounded-2xl bg-white dark:bg-neutral/10 border border-gray-200 dark:border-white/20">
                      <h3 className="font-bold text-lg text-gray-800 dark:text-white/90 mb-4">Recent Activity</h3>
                      <div className="space-y-2">
                        {recentHistory && recentHistory.length > 0 ? (
                           recentHistory.map(item => (
                            <Link href={`/?historyId=${item.id}`} key={item.id} className="flex justify-between items-center p-3 rounded-lg hover:bg-neutral/20 transition-colors -mx-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {item.inputType === 'image' ? 
                                        <FileImage className="text-white/60 flex-shrink-0"/> : 
                                        <FileText className="text-white/60 flex-shrink-0"/>
                                    }
                                    <div className="overflow-hidden">
                                        <p className="font-medium text-white text-sm truncate">{item.inputType === 'image' ? "Image Analysis" : item.inputValue}</p>
                                        <ClientOnlyTimestamp timestamp={item.id} />
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 ${item.result.isLikelyFake ? 'text-danger-text bg-danger/10' : 'text-success-text bg-success/10'}`}>
                                    {item.result.isLikelyFake ? 'Likely Fake' : 'Likely Auth.'}
                                </span>
                            </Link>
                           ))
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-white/60">No recent activity to display.</p>
                            </div>
                        )}
                      </div>
                    </div>
                </div>
              </div>
          </main>
      </div>
  );
}