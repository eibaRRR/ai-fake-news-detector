"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CheckCircle, AlertTriangle, Scale, MessageSquareQuote, Flame, Link as LinkIcon, HelpCircle, ThumbsUp, ThumbsDown } from "lucide-react";
import ConfidenceGauge from "./ConfidenceGauge";
import Tooltip from "./Tooltip";

// --- AnalysisFeedback component code is included directly here ---
function AnalysisFeedback({ analysisId }) {
    const [feedbackSent, setFeedbackSent] = useState(null);
    const [error, setError] = useState('');

    const handleFeedback = async (feedbackType) => {
        if (feedbackSent) return;
        setFeedbackSent('sending');
        setError('');
        try {
            const res = await fetch('/api/analysis-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ analysisId, feedback: feedbackType }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to submit feedback.');
            }
            setFeedbackSent('sent');
        } catch (err) {
            setError(err.message);
            setFeedbackSent(null);
        }
    };

    if (feedbackSent === 'sent') {
        return <p className="text-sm text-center text-green-600 dark:text-green-400 font-medium">Thank you for your feedback!</p>;
    }

    return (
        <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-white/70 mb-2">Was this analysis helpful?</p>
            <div className="flex justify-center items-center gap-4">
                <button onClick={() => handleFeedback('helpful')} disabled={feedbackSent === 'sending'} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white/80 transition-colors disabled:opacity-50">
                    <ThumbsUp size={16} /> Helpful
                </button>
                <button onClick={() => handleFeedback('unhelpful')} disabled={feedbackSent === 'sending'} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white/80 transition-colors disabled:opacity-50">
                    <ThumbsDown size={16} /> Not Helpful
                </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
    );
}

const DetailCard = ({ icon, label, value, tooltipContent }) => {
    const Icon = icon;
    return (
        <div className="relative rounded-2xl p-4 bg-gray-100/50 dark:bg-neutral/10 border border-gray-200 dark:border-white/20 shadow-lg text-center">
            <div className="flex justify-center items-center gap-1.5 text-sm font-semibold text-gray-600 dark:text-white/70 mb-2">
                <Icon size={16} />
                <h4>{label}</h4>
                {tooltipContent && (
                    <Tooltip content={tooltipContent}>
                        <HelpCircle size={14} className="cursor-help text-gray-400 dark:text-white/50" />
                    </Tooltip>
                )}
            </div>
            <p className="font-bold text-lg text-gray-900 dark:text-white/90">{value}</p>
        </div>
    );
};

export default function ResultsRightColumn({ result }) {
    const { data: session } = useSession();
    const [sourceIcons, setSourceIcons] = useState({});

    useEffect(() => {
        if (result?.sources) {
          const fetchIcons = async () => {
            const icons = {};
            for (const source of result.sources) {
              try {
                const res = await fetch(`/api/get-favicon?url=${encodeURIComponent(source.url)}`);
                if (res.ok) {
                  const data = await res.json();
                  if(data.favicon) {
                    icons[source.url] = data.favicon;
                  }
                }
              } catch (e) {
                console.error("Failed to fetch favicon for", source.url);
              }
            }
            setSourceIcons(icons);
          };
          fetchIcons();
        }
    }, [result?.sources]);

    return (
        <div className="md:w-1/2 space-y-4">
          <div
            className={`relative flex flex-col items-center justify-center rounded-2xl p-5 border shadow-lg overflow-hidden ${
              result?.isLikelyFake
                ? "bg-danger/10 dark:bg-danger/20 border-danger/20 dark:border-danger/30"
                : "bg-success/10 dark:bg-success/20 border-success/20 dark:border-success/30"
            }`}
          >
            <p className={`text-lg font-semibold mb-4 flex items-center gap-2 ${result?.isLikelyFake ? 'text-danger-text' : 'text-success-text'}`}>
              {result?.isLikelyFake
                ? <><AlertTriangle size={20}/> Likely Fake News</>
                : <><CheckCircle size={20}/> Likely Authentic</>}
            </p>
            <ConfidenceGauge value={result?.confidence ?? 0} isFake={result?.isLikelyFake} />
          </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result?.bias && <DetailCard icon={Scale} label="Detected Bias" value={result.bias} tooltipContent="The political or ideological leaning detected in the text's language and framing."/>}
                {result?.tone && <DetailCard icon={MessageSquareQuote} label="Detected Tone" value={result.tone} tooltipContent="The overall emotional sentiment conveyed by the author's word choice." />}
                {result?.sensationalism && <DetailCard icon={Flame} label="Sensationalism" value={result.sensationalism} tooltipContent="The use of exaggerated or shocking language to provoke a strong emotional response." />}
           </div>

          <div className="relative rounded-2xl p-5 bg-gray-100/50 dark:bg-neutral/10 border border-gray-200 dark:border-white/20 shadow-lg">
            <div className="relative z-10">
              <h4 className="font-medium text-gray-800 dark:text-white/90">AI Analysis:</h4>
              <div className="mt-2 p-3 rounded-lg bg-gray-200/50 dark:bg-black/20 border-gray-300 dark:border-white/20 max-h-48 overflow-y-auto">
                <p className="text-gray-700 dark:text-white/80">
                  {result?.analysis || "No analysis available"}
                </p>
              </div>
            </div>
          </div>

          {result?.sources?.length > 0 && (
            <div className="relative rounded-2xl p-5 bg-gray-100/50 dark:bg-neutral/10 border border-gray-200 dark:border-white/20 shadow-lg">
              <div className="relative z-10">
                <h4 className="font-medium text-gray-800 dark:text-white/90 mb-3">
                  Verification Sources:
                </h4>
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {result.sources.map((source, index) => (
                    <li key={index}>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-500 dark:text-blue-300 hover:text-blue-600 dark:hover:text-blue-200 group"
                      >
                        <img 
                          src={sourceIcons[source.url] || `https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=16`}
                          alt="favicon"
                          className="w-4 h-4 rounded-full object-contain bg-white"
                          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
                        />
                        <LinkIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 hidden" />
                        <span className="truncate group-hover:underline">{source.title || source.url}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {session && result?.id && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/20">
                <AnalysisFeedback analysisId={result.id} />
            </div>
          )}
        </div>
    );
}