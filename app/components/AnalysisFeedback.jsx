"use client";

import { useState } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';

export default function AnalysisFeedback({ analysisId }) {
    const [feedbackSent, setFeedbackSent] = useState(null); // null, 'sending', 'sent'
    const [error, setError] = useState('');

    const handleFeedback = async (feedbackType) => {
        if (feedbackSent) return; // Prevent multiple submissions

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
            setFeedbackSent(null); // Allow retry on error
        }
    };

    if (feedbackSent === 'sent') {
        return (
            <p className="text-sm text-center text-green-600 dark:text-green-400 font-medium">
                Thank you for your feedback!
            </p>
        );
    }

    return (
        <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-white/70 mb-2">Was this analysis helpful?</p>
            <div className="flex justify-center items-center gap-4">
                <button
                    onClick={() => handleFeedback('helpful')}
                    disabled={feedbackSent === 'sending'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white/80 transition-colors disabled:opacity-50"
                >
                    <ThumbsUp size={16} />
                    Helpful
                </button>
                <button
                    onClick={() => handleFeedback('unhelpful')}
                    disabled={feedbackSent === 'sending'}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white/80 transition-colors disabled:opacity-50"
                >
                    <ThumbsDown size={16} />
                    Not Helpful
                </button>
            </div>
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
    );
}