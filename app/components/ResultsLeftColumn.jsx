"use client";

import Tooltip from "./Tooltip";
import { ChevronRight, BrainCircuit, HelpCircle } from "lucide-react";

export default function ResultsLeftColumn({ inputType, inputValue, result }) {
    return (
        <div className="md:w-1/2 space-y-4">
          
          {inputType === "image" && (
            <div className="relative rounded-2xl p-5 bg-gray-100/50 dark:bg-neutral/10 border border-gray-200 dark:border-white/20 shadow-lg overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-3">
                  Original Image:
                </h3>
                <div className="rounded-xl bg-gray-200/50 dark:bg-black/20 border border-gray-300 dark:border-white/20 overflow-hidden">
                  <img
                    src={inputValue}
                    alt="News to verify"
                    className="w-full rounded-lg object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          {result?.mainClaims?.length > 0 && (
            <div className="relative rounded-2xl p-5 bg-gray-100/50 dark:bg-neutral/10 border border-gray-200 dark:border-white/20 shadow-lg">
                <div className="relative z-10">
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
                        Main Claims Identified
                    </h3>
                    <ul className="space-y-2 mt-3">
                        {result.mainClaims.map((claim, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-gray-200/50 dark:bg-black/20 border border-gray-300 dark:border-white/20">
                                <ChevronRight className="text-primary flex-shrink-0 mt-1" size={16} />
                                <span className="text-gray-700 dark:text-white/80 text-sm">{claim}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
          )}
          
          {result?.logicalFallacies?.length > 0 && (
            <div className="relative rounded-2xl p-5 bg-gray-100/50 dark:bg-neutral/10 border border-gray-200 dark:border-white/20 shadow-lg">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 flex items-center gap-2">
                            <BrainCircuit size={20} className="text-primary"/> Logical Fallacies
                        </h3>
                        <Tooltip content="Flaws in reasoning used to persuade. They might not be factually wrong, but are structurally deceptive.">
                           <HelpCircle size={14} className="cursor-help text-gray-400 dark:text-white/50" />
                        </Tooltip>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {result.logicalFallacies.map((fallacy, index) => (
                           <span key={index} className="px-2.5 py-1 text-xs font-medium rounded-full bg-yellow-200/50 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-400/50 dark:border-yellow-500/30">
                               {fallacy}
                           </span>
                        ))}
                    </div>
                </div>
            </div>
          )}

          {result?.extractedText && (
            <div className="relative rounded-2xl p-5 bg-gray-100/50 dark:bg-neutral/10 border border-gray-200 dark:border-white/20 shadow-lg">
              <div className="relative z-10">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white/90 mb-2">
                  {inputType === "image" ? "Extracted Text:" : "Analyzed Text:"}
                </h3>
                <div className="p-3 rounded-lg bg-gray-200/50 dark:bg-black/20 border border-gray-300 dark:border-white/20 max-h-60 overflow-y-auto">
                  <p className="text-gray-700 dark:text-white/80 whitespace-pre-wrap">
                    {result.extractedText}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
    );
}