"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from "framer-motion";
import { FileUp, Link as LinkIcon, Type, Newspaper, BarChart4, AlertTriangle } from "lucide-react";

import AnalysisResults from "@/app/components/AnalysisResults";
import ImageUploader from "@/app/components/ImageUploader";
import ImageUrlUploader from "@/app/components/ImageUrlUploader";
import TextUploader from "@/app/components/TextUploader";
import SkeletonLoader from "@/app/components/SkeletonLoader";
import HistorySidebar from "@/app/components/HistorySidebar";
import AuthStatus from "@/app/components/AuthStatus";
import ArticleUrlUploader from "@/app/components/ArticleUrlUploader";
import FeatureHighlights from "@/app/components/FeatureHighlights";
import MissionStatement from "@/app/components/MissionStatement";
import CallToAction from "@/app/components/CallToAction";
import HowItWorks from "@/app/components/HowItWorks";

const viewVariants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.4, ease: "easeInOut" }
};

function HomeComponent() {
  const searchParams = useSearchParams();
  const historyId = searchParams.get('historyId');

  const [activeTab, setActiveTab] = useState("file");
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const { data: session, status: sessionStatus } = useSession();

  const fetchHistory = useCallback(async () => {
    if (sessionStatus === 'authenticated') {
      try {
        const res = await fetch('/api/history');
        if (res.ok) {
          const data = await res.json();
          setHistory(data.reverse());
        } else {
          setHistory([]);
        }
      } catch (e) {
        setHistory([]);
      }
    } else {
      setHistory([]);
    }
  }, [sessionStatus]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);
  
  useEffect(() => {
    if (historyId && history.length > 0) {
      const itemToLoad = history.find(item => String(item.id) === historyId);
      if (itemToLoad) {
        setCurrentAnalysis(itemToLoad);
      }
    }
  }, [historyId, history]);


  const handleAnalysisSuccess = () => {
    fetchHistory();
  };
  
  const startAnalysis = async (apiEndpoint, body) => {
    setIsLoading(true);
    setError(null);
    setCurrentAnalysis(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "An API error occurred.");
      }
      
      const data = await response.json();
      
      let inputType = 'text';
      if (apiEndpoint.includes('news')) inputType = 'image';
      if (apiEndpoint.includes('analyze-url')) inputType = 'text';
      
      const inputValue = body.imageUrl || body.text || body.url;

      setCurrentAnalysis({ inputType, inputValue, result: data });
      handleAnalysisSuccess();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleImageUpload = async (url) => {
    await startAnalysis("/api/analyze-news", { imageUrl: url });
  };

  const handleTextAnalysis = async (text) => {
    await startAnalysis("/api/analyze-text", { text: text });
  };

  const handleArticleUrlAnalysis = async (url) => {
    await startAnalysis("/api/analyze-url", { url });
  };

  const handleReanalyze = () => {
    if (!currentAnalysis) return;
    const { inputType, inputValue } = currentAnalysis;
    if (inputType === 'text') {
        handleTextAnalysis(inputValue);
    } else {
        handleImageUpload(inputValue);
    }
  };

  const handleHistoryClick = (id) => {
    const historyItem = history.find(item => item.id === id);
    if (historyItem) {
      setError(null);
      setIsLoading(false);
      setCurrentAnalysis(historyItem);
    }
  };
  
  const handleClearHistory = async () => {
      if (sessionStatus === 'authenticated') {
        await fetch('/api/history', { method: 'DELETE' });
        setHistory([]);
      }
  };
  
  const handleReset = () => {
    setCurrentAnalysis(null);
    setError(null);
    setIsLoading(false);
  };

  const renderUploader = () => {
    switch (activeTab) {
        case "file": return <ImageUploader onUpload={handleImageUpload} />;
        case "image-url": return <ImageUrlUploader onUpload={handleImageUpload} />;
        case "article-url": return <ArticleUrlUploader onUpload={handleArticleUrlAnalysis} />;
        case "text": return <TextUploader onUpload={handleTextAnalysis} />;
        default: return <ImageUploader onUpload={handleImageUpload} />;
    }
  };

  const showUploader = !currentAnalysis && !isLoading && !error;

    return (
        <div className="relative min-h-screen">
          <main className="container mx-auto px-4 py-8 relative z-10">
            <motion.div 
                className="relative max-w-4xl mx-auto"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
              {/* Only render the HistorySidebar if the user is logged in */}
              {session && (
                <HistorySidebar 
                    history={history} 
                    onHistoryClick={handleHistoryClick} 
                    onClearHistory={handleClearHistory} 
                />
              )}
    
              <div className="animated-border-box relative backdrop-blur-2xl bg-white/5 rounded-2xl shadow-2xl overflow-hidden p-8">
                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="flex w-full items-start justify-between gap-4"
                    >
                        <div className="flex items-center gap-3">
                            <BarChart4 size={36} className="text-primary" />
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg whitespace-nowrap">
                                AI Fake News Detector
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <AuthStatus />
                        </div>
                    </motion.div>
    
                  {showUploader && (
                    <div className="flex justify-center flex-wrap gap-x-2 border-b border-white/20 my-6">
                      <TabButton label="Upload File" isActive={activeTab === "file"} onClick={() => setActiveTab("file")} icon={<FileUp size={16}/>} />
                      <TabButton label="Image URL" isActive={activeTab === "image-url"} onClick={() => setActiveTab("image-url")} icon={<LinkIcon size={16}/>}/>
                      <TabButton label="Article URL" isActive={activeTab === "article-url"} onClick={() => setActiveTab("article-url")} icon={<Newspaper size={16}/>}/>
                      <TabButton label="Text Article" isActive={activeTab === "text"} onClick={() => setActiveTab("text")} icon={<Type size={16}/>}/>
                    </div>
                  )}
                    
                  <div className="mt-6 min-h-[360px] flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                      {showUploader && ( <motion.div key="uploader" {...viewVariants}> {renderUploader()} </motion.div> )}
                      {isLoading && ( <motion.div key="loader" {...viewVariants}> <SkeletonLoader /> </motion.div> )}
                      {error && (
                        <motion.div key="error" {...viewVariants} className="flex flex-col items-center text-center">
                            <div className="relative p-6 rounded-xl backdrop-blur-sm bg-danger/20 border border-danger/30">
                              <div className="flex items-center justify-center gap-3">
                                <AlertTriangle className="text-danger-text" size={24}/>
                                <p className="text-lg font-semibold text-danger-text drop-shadow-lg">Analysis Failed</p>
                              </div>
                              <p className="text-red-200 text-sm mt-2">{error}</p>
                              <button onClick={handleReset} className="mt-6 px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all duration-200 border border-white/30 hover:border-white/40 backdrop-blur-sm mx-auto block">
                                Try Again
                              </button>
                            </div>
                        </motion.div>
                      )}
                      {currentAnalysis && (
                        <motion.div key="results" {...viewVariants}>
                          <AnalysisResults
                            result={currentAnalysis.result}
                            onReset={handleReset}
                            onReanalyze={handleReanalyze}
                            inputType={currentAnalysis.inputType}
                            inputValue={currentAnalysis.inputValue}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {showUploader && (
                <div className="max-w-4xl mx-auto">
                    <HowItWorks />
                    <FeatureHighlights />
                    <MissionStatement />
                    <CallToAction />
                </div>
            )}
    
          </main>
        </div>
      );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center text-slate-500/50"><p>Loading...</p></div>}>
            <HomeComponent />
        </Suspense>
    )
}

function TabButton({ label, isActive, onClick, icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-t-lg focus:outline-none focus-ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-primary ${
                isActive 
                ? "text-primary border-b-2 border-primary" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
}
