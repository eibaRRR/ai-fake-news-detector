"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Rss, Zap, Home, AlertCircle, Loader2 } from "lucide-react";
import LiveArticleCard from "../components/LiveArticleCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Animation variants for the container and list items
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // Time delay between each child animating in
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};


export default function LiveMonitoringPage() {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If the session is loaded and there is no user, redirect to signup
    if (status === "unauthenticated") {
      router.replace("/signup");
    }
  }, [status, router]);


  const fetchAndAnalyzeNews = async () => {
    setIsLoading(true);
    setError(null);
    setArticles([]);

    try {
      const rawArticlesRes = await fetch('/api/fetch-live-news');
      if (!rawArticlesRes.ok) {
        const err = await rawArticlesRes.json();
        throw new Error(err.error || "Could not fetch news headlines.");
      }
      const rawArticles = await rawArticlesRes.json();

      if (rawArticles.length === 0) {
        throw new Error("No articles were returned from the news service.");
      }
      
      setArticles(rawArticles.map(article => ({ ...article, id: article.url, status: 'loading' })));
      setIsLoading(false);

      for (let i = 0; i < rawArticles.length; i++) {
        const article = rawArticles[i];
        const textToAnalyze = `${article.title}. ${article.description}`;
        
        try {
          const analysisRes = await fetch('/api/analyze-text', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: textToAnalyze, source: 'live-feed' })
          });

          if (!analysisRes.ok) throw new Error('Analysis request failed');

          const analysisResult = await analysisRes.json();
          
          setArticles(prev => prev.map((a, index) => 
              index === i ? { ...a, status: 'analyzed', analysis: analysisResult } : a
          ));
        } catch (e) {
            setArticles(prev => prev.map((a, index) => 
                index === i ? { ...a, status: 'error', error: e.message || 'Analysis failed.' } : a
            ));
        }
      }
    } catch (e) {
      setError(e.message);
      setIsLoading(false);
    }
  };

  // Show a loading spinner while checking the session
  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Only render the page if the user is authenticated
  if (status === "authenticated") {
    return (
      <div className="relative min-h-screen bg-transparent">
          <main className="container mx-auto px-4 py-8 relative z-10">
              <motion.div 
                  className="relative max-w-7xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
              >
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                       <div className="flex items-center gap-3">
                          <Rss size={32} className="text-primary" />
                          <h1 className="text-4xl font-bold text-white drop-shadow-lg">Live News Feed</h1>
                      </div>
                      <div className="flex items-center gap-4">
                          <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral/20 hover:bg-neutral/30 text-white rounded-lg transition-colors">
                              <Home size={16} />
                              Back to Manual Analysis
                          </Link>
                          <button onClick={fetchAndAnalyzeNews} disabled={isLoading} className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-primary/80 hover:bg-primary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                              <Zap size={16} />
                              {isLoading ? 'Fetching...' : 'Fetch Latest News'}
                          </button>
                      </div>
                  </div>

                  {error && (
                      <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-danger/20 text-danger-text">
                          <AlertCircle size={20} />
                          <p>{error}</p>
                      </div>
                  )}
                  
                  <AnimatePresence>
                      {articles.length > 0 && (
                          <motion.div
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                          >
                              {articles.map((article) => (
                                  <motion.div key={article.id} variants={itemVariants}>
                                      <LiveArticleCard article={article} />
                                  </motion.div>
                              ))}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </motion.div>
          </main>
      </div>
    );
  }

  // Fallback for when status is neither loading nor authenticated
  return null;
}