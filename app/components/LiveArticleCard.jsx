"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Clock, ExternalLink, ShieldQuestion, SearchCheck } from "lucide-react";

const LiveArticleCard = ({ article, onAnalyze }) => {
    const { status, title, description, url, source, image, analysis, error } = article;

    const renderStatus = () => {
        switch (status) {
            case 'unanalyzed':
                return (
                    <button 
                        onClick={onAnalyze} 
                        className="flex items-center gap-2 text-sm font-medium text-white bg-primary/80 hover:bg-primary px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <SearchCheck size={16} />
                        <span>Analyser</span>
                    </button>
                );
            case 'loading':
                return (
                    <div className="flex items-center gap-2 text-sm text-primary">
                        <Clock size={16} className="animate-spin" />
                        <span>Analyzing...</span>
                    </div>
                );
            case 'analyzed':
                return (
                    <div className={`flex items-center gap-2 text-sm font-bold ${analysis.isLikelyFake ? 'text-danger-text' : 'text-success-text'}`}>
                        {analysis.isLikelyFake ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                        <span>{analysis.isLikelyFake ? 'Likely Fake' : 'Likely Authentic'} ({analysis.confidence}%)</span>
                    </div>
                );
            case 'error':
                 return (
                    <div className="flex items-center gap-2 text-sm font-bold text-danger-text">
                        <ShieldQuestion size={16} />
                        <span>Analysis Failed</span>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="relative rounded-2xl p-5 backdrop-blur-xl bg-neutral/10 border border-white/10 shadow-lg h-full flex flex-col"
        >
            {image && <img src={image} alt={title} className="rounded-lg mb-4 h-40 w-full object-cover"/>}
            
            <div className="flex-grow flex flex-col">
                <p className="text-xs text-white/60 mb-1">{source.name}</p>
                <h3 className="font-bold text-md text-white/90 mb-2 flex-grow">{title}</h3>
                <p className="text-sm text-white/70 line-clamp-3">{description}</p>
            </div>
           
            <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                {renderStatus()}
                <a href={url} target="_blank" rel="noopener noreferrer" title="Read full article" className="p-2 text-white/60 hover:text-white transition-colors">
                    <ExternalLink size={16}/>
                </a>
            </div>
        </motion.div>
    );
};

export default LiveArticleCard;