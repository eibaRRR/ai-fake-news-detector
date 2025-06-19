"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Rss, Home, AlertCircle, Loader2 } from "lucide-react";
import LiveArticleCard from "../components/LiveArticleCard";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { data: session, status } = useSession();
  const router = useRouter();

  // 1. Fetch only the list of articles when the page loads
  const fetchNews = useCallback(async () => {
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
      
      // Set the initial state of articles to 'unanalyzed'
      setArticles(rawArticles.map(article => ({ ...article, id: article.url, status: 'unanalyzed', analysis: null })));

    } catch (e) {
      setError(e.message);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchNews();
    } else if (status === "unauthenticated") {
      router.replace("/signup");
    }
  }, [status, router, fetchNews]);

  // 2. This function will be called to analyze a SINGLE article
  const handleAnalyzeArticle = useCallback(async (articleId) => {
    const articleIndex = articles.findIndex(a => a.id === articleId);
    if (articleIndex === -1) return;

    // Set the specific article's status to 'loading'
    setArticles(prev => prev.map((a, i) => 
        i === articleIndex ? { ...a, status: 'loading' } : a
    ));

    const articleToAnalyze = articles[articleIndex];
    const textToAnalyze = `${articleToAnalyze.title}. ${articleToAnalyze.description}`;
    
    try {
      const analysisRes = await fetch('/api/analyze-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textToAnalyze, source: 'live-feed' })
      });

      if (!analysisRes.ok) throw new Error('Analysis request failed');

      const analysisResult = await analysisRes.json();
      
      // Update only the analyzed article with the result
      setArticles(prev => prev.map((a, i) => 
          i === articleIndex ? { ...a, status: 'analyzed', analysis: analysisResult } : a
      ));
    } catch (e) {
        // Or update it with an error status
        setArticles(prev => prev.map((a, i) => 
            i === articleIndex ? { ...a, status: 'error', error: e.message || 'Analysis failed.' } : a
        ));
    }
  }, [articles]); // Dependency on `articles` is needed

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

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
                      <Link href="/" className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-neutral/20 hover:bg-neutral/30 text-white rounded-lg transition-colors">
                          <Home size={16} />
                          Back to Manual Analysis
                      </Link>
                  </div>

                  {isLoading && <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}

                  {error && (
                      <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-danger/20 text-danger-text">
                          <AlertCircle size={20} />
                          <p>{error}</p>
                      </div>
                  )}
                  
                  <AnimatePresence>
                      {!isLoading && articles.length > 0 && (
                          <motion.div
                              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                              variants={containerVariants}
                              initial="hidden"
                              animate="visible"
                          >
                              {articles.map((article) => (
                                  <motion.div key={article.id} variants={itemVariants}>
                                      <LiveArticleCard 
                                        article={article} 
                                        onAnalyze={() => handleAnalyzeArticle(article.id)}
                                      />
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
  
  return null;
}