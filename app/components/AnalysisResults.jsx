"use client";

import ResultsLeftColumn from "./ResultsLeftColumn.jsx";
import ResultsRightColumn from "./ResultsRightColumn";

export default function AnalysisResults({
  result,
  onReset,
  onReanalyze,
  inputType,
  inputValue,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white/90">
          Analysis Results
        </h2>
        <div className="flex items-center gap-2">
            <button
              onClick={onReanalyze}
              className="relative px-4 py-2 text-sm font-medium bg-gray-200/60 dark:bg-neutral/20 hover:bg-gray-200/90 dark:hover:bg-neutral/30 text-gray-800 dark:text-white rounded-lg transition-all duration-200 border border-gray-300 dark:border-white/20"
            >
              Re-analyze
            </button>
            <button
              onClick={onReset}
              className="relative px-4 py-2 text-sm font-medium bg-primary/80 hover:bg-primary text-white rounded-lg transition-all duration-200 border border-primary/90"
            >
              Analyze Another
            </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <ResultsLeftColumn 
          inputType={inputType}
          inputValue={inputValue}
          result={result}
        />
        <ResultsRightColumn 
          result={result}
        />
      </div>
    </div>
  );
}