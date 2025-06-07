export default function ConfidenceGauge({ value, isFake }) {
  // UPDATED: Uses new 'danger-text' and 'success-text' theme colors
  const color = isFake ? "text-danger-text" : "text-success-text";
  const bgColor = isFake ? "bg-danger/20" : "bg-success/20";
  const circumference = 2 * Math.PI * 45; // 2 * pi * radius
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center h-32 w-32">
      <svg className="transform -rotate-90" width="120" height="120" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          className={`opacity-20 ${color}`}
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`transition-all duration-1000 ease-out ${color}`}
        />
      </svg>
      <div className={`absolute flex flex-col items-center justify-center h-20 w-20 rounded-full ${bgColor}`}>
         <span className={`text-2xl font-bold text-white`}>{value}%</span>
         <span className="text-xs text-white/80">Confidence</span>
      </div>
    </div>
  );
}