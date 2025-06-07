"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2, AlertTriangle, BarChart, CheckCircle, Target, Home } from "lucide-react";
import StatCard from "@/app/components/StatCard";
import AnalysisDonutChart from "@/app/components/AnalysisDonutChart";
import Link from 'next/link';
import ClientOnlyTimestamp from "@/app/components/ClientOnlyTimestamp"; // Make sure this is imported

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [stats, setStats] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    
    if (status === "authenticated") {
      if (!stats) {
        fetch('/api/dashboard-stats')
          .then(res => res.json())
          .then(data => {
              if(data.error) setError(data.error);
              else setStats(data);
          });
      }
      
      if (recentHistory.length === 0) {
        fetch('/api/history')
          .then(res => res.json())
          .then(data => {
            if(Array.isArray(data)) {
              setRecentHistory(data.reverse().slice(0, 5));
            }
          });
      }
    }
  }, [status, router, stats, recentHistory]);

  if (status === "loading" || !stats) {
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
                    {(stats.quizAccuracy !== undefined && stats.quizAccuracy > 0) && (
                      <StatCard icon={<Target size={24} className="text-yellow-400"/>} label="Quiz Accuracy" value={`${stats.quizAccuracy}%`} colorClass="bg-yellow-400"/>
                    )}
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="p-4 rounded-2xl bg-white dark:bg-neutral/10 border border-gray-200 dark:border-white/20">
                      <AnalysisDonutChart authenticCount={stats.authenticCount} fakeCount={stats.fakeCount} />
                    </div>

                    <div>
                      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/80 mb-4">Recent Activity</h2>
                      <div className="space-y-4">
                          {recentHistory.length > 0 ? (
                              recentHistory.map(item => (
                                  <div key={item.id} className="p-4 rounded-xl bg-white dark:bg-neutral/10 border border-gray-200 dark:border-white/20 flex justify-between items-center">
                                      <div>
                                          <p className="font-semibold text-gray-800 dark:text-white/90">{item.inputType === 'image' ? "Image Analysis" : `"${item.inputValue.substring(0, 40)}..."`}</p>
                                          {/* Use the ClientOnlyTimestamp component here */}
                                          <ClientOnlyTimestamp timestamp={item.id} />
                                      </div>
                                      <Link href={`/?historyId=${item.id}`} className={`text-sm font-bold px-3 py-1 rounded-full ${item.result.isLikelyFake ? 'text-danger-text bg-danger/10' : 'text-success-text bg-success/10'}`}>
                                          {item.result.isLikelyFake ? 'Likely Fake' : 'Likely Auth.'}
                                      </Link>
                                  </div>
                              ))
                          ) : (
                              <p className="text-gray-500 dark:text-white/50 text-center py-8">No recent activity found.</p>
                          )}
                      </div>
                    </div>
                </div>

              </div>
          </main>
      </div>
  );
}