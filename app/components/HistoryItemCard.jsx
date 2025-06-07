"use client";

import Link from 'next/link';
import { FileText, FileImage, CheckCircle, AlertTriangle, Calendar, Eye } from 'lucide-react';

export default function HistoryItemCard({ item }) {
  const { id, inputType, inputValue, result } = item;
  const isFake = result.isLikelyFake;
  const displayValue = inputType === 'image' 
    ? "Image Analysis" 
    : `"${inputValue.substring(0, 50)}..."`;

  return (
    <div className="relative rounded-2xl p-5 backdrop-blur-lg bg-neutral/10 border border-white/20 shadow-lg flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center gap-2 text-white/70 mb-2">
          {inputType === 'image' ? <FileImage size={16} /> : <FileText size={16} />}
          <span className="text-sm font-semibold uppercase">{inputType} Analysis</span>
        </div>
        <p className="text-md font-medium text-white/90 mb-3 break-words h-16">
          {displayValue}
        </p>
        <div className="flex items-center gap-2 text-xs text-white/60 mb-4">
            <Calendar size={14} />
            <span>{new Date(id).toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="mt-auto pt-4 border-t border-white/20 flex justify-between items-center">
        <div className={`flex items-center gap-2 text-sm font-bold ${isFake ? 'text-danger-text' : 'text-success-text'}`}>
            {isFake ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            <span>{isFake ? 'Likely Fake' : 'Likely Authentic'}</span>
        </div>
        <Link href={`/?historyId=${id}`} className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-neutral/20 hover:bg-neutral/30 text-white rounded-lg transition-colors">
            <Eye size={14} />
            View
        </Link>
      </div>
    </div>
  );
}