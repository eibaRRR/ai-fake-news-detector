"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Home, Lightbulb, Repeat, Award, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function QuizResults({ score, totalQuestions, onRestart }) {
  useEffect(() => {
    if (totalQuestions === 0) return;

    const saveScore = async () => {
      try {
        await fetch('/api/quiz-score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score, totalQuestions }),
        });
        console.log("Quiz score saved successfully.");
      } catch (e) {
        console.error("Could not save quiz score:", e);
      }
    };

    saveScore();
  }, [score, totalQuestions]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative backdrop-blur-2xl bg-white/5 rounded-2xl shadow-2xl p-8 border border-white/10 max-w-2xl w-full">
            <Award size={48} className="text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Quiz Completed!</h1>
            <p className="text-5xl font-bold text-primary my-6">
                {score} / {totalQuestions}
            </p>
            <div className="flex justify-center gap-4">
                <button onClick={onRestart} className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-neutral/20 hover:bg-neutral/30 text-white rounded-lg">
                    <Repeat size={16} />
                    Play New Quiz
                </button>
                <Link href="/" className="flex items-center gap-2 px-5 py-2 text-sm font-medium bg-primary/80 hover:bg-primary text-white rounded-lg">
                    <Home size={16} />
                    Back to Home
                </Link>
            </div>
        </motion.div>
      </div>
  );
}


export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { data: session, status } = useSession();
  const router = useRouter();

  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQuestions([]);
    try {
        const response = await fetch('/api/generate-quiz');
        if (!response.ok) {
            throw new Error('Failed to generate a new quiz. Please try again.');
        }
        const data = await response.json();
        setQuestions(data.map((q, index) => ({...q, id: index})));
    } catch(err) {
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If the session is loaded and there is no user, redirect to signup
    if (status === "unauthenticated") {
      router.replace("/signup");
    }
    // If authenticated, fetch the quiz questions
    if (status === "authenticated") {
      fetchQuestions();
    }
  }, [status, router, fetchQuestions]);

  const handleAnswer = (userAnswer) => {
    if (showFeedback) return;
    setSelectedAnswer({userAnswer, isCorrect: userAnswer === currentQuestion.isFake});
    if (userAnswer === currentQuestion.isFake) {
      setScore((prev) => prev + 1);
    }
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowFeedback(false);
    setSelectedAnswer(null);
    fetchQuestions();
  };
  
  // Show a loading spinner while checking the session and fetching questions
  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-white/80">
            <Loader2 className="animate-spin h-10 w-10 mb-4" />
            <p className="text-lg">Loading Quiz...</p>
        </div>
    );
  }
  
  if (error) {
     return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center text-danger-text p-4">
            <h2 className="text-2xl font-bold">Oops! Something went wrong.</h2>
            <p className="text-white/70 mt-2">{error}</p>
            <button onClick={restartQuiz} className="mt-6 flex items-center gap-2 px-5 py-2 text-sm font-medium bg-primary/80 hover:bg-primary text-white rounded-lg">
                <Repeat size={16} />
                Try to Generate Again
            </button>
        </div>
     );
  }

  const isQuizFinished = currentQuestionIndex >= questions.length && questions.length > 0;
  const currentQuestion = questions[currentQuestionIndex];
  
  if (isQuizFinished) {
    return <QuizResults score={score} totalQuestions={questions.length} onRestart={restartQuiz} />
  }

  // Only render the quiz if the user is authenticated and questions are loaded
  if (status === "authenticated" && currentQuestion) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-2xl">
                <p className="text-center text-primary font-semibold mb-2">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <div className="relative backdrop-blur-2xl bg-white/5 rounded-2xl shadow-2xl p-8 border border-white/10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestion.id || currentQuestionIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.4 }}
                        >
                            <p className="text-center text-white/70 text-sm mb-4">Is this headline real or fake?</p>
                            <h2 className="text-2xl font-medium text-center text-white">{currentQuestion.title}</h2>

                            {!showFeedback && (
                                <div className="flex justify-center gap-4 mt-8">
                                    <button onClick={() => handleAnswer(false)} className="px-8 py-3 text-lg font-bold bg-success/20 hover:bg-success/40 text-success-text rounded-lg border border-success/30">
                                        Real
                                    </button>
                                    <button onClick={() => handleAnswer(true)} className="px-8 py-3 text-lg font-bold bg-danger/20 hover:bg-danger/40 text-danger-text rounded-lg border border-danger/30">
                                        Fake
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <AnimatePresence>
                    {showFeedback && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center">
                            <div className={`p-4 rounded-lg border ${selectedAnswer.isCorrect ? 'bg-success/10 border-success/30' : 'bg-danger/10 border-danger/30'}`}>
                                <div className={`flex items-center justify-center gap-2 font-bold ${selectedAnswer.isCorrect ? 'text-success-text' : 'text-danger-text'}`}>
                                    {selectedAnswer.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
                                    <span>{selectedAnswer.isCorrect ? "Correct!" : "Incorrect"}</span>
                                </div>
                                <div className="flex items-start gap-3 mt-3 text-left text-white/80 p-3 bg-black/20 rounded-lg">
                                    <Lightbulb className="flex-shrink-0 mt-1 text-primary" size={16}/>
                                    <span>{currentQuestion.explanation}</span>
                                </div>
                            </div>
                            <button onClick={handleNextQuestion} className="w-full mt-4 px-5 py-2 bg-primary/80 hover:bg-primary text-white rounded-lg">
                                Next Question
                            </button>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
  }

  // Fallback for when status is neither loading nor authenticated
  return null;
}
