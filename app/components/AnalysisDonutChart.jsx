"use client";

const DonutSegment = ({ colorClass, percentage, offset, radius, strokeWidth, label }) => {
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = offset;

    return (
        <circle
            className={colorClass}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            r={radius}
            cx="50%"
            cy="50%"
            fill="transparent"
            strokeLinecap="round"
            transform="rotate(-90 100 100)"
        />
    );
};

export default function AnalysisDonutChart({ authenticCount, fakeCount }) {
    const total = authenticCount + fakeCount;
    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-6 h-full text-center">
                 <p className="font-bold text-lg text-gray-800 dark:text-white/90">Analysis Breakdown</p>
                 <p className="text-sm text-gray-500 dark:text-white/60 mt-2">No data available. Analyze an article to see your stats here!</p>
            </div>
        )
    }

    const radius = 80;
    const strokeWidth = 25;
    const circumference = 2 * Math.PI * radius;

    const authenticPercentage = (authenticCount / total);
    const fakePercentage = (fakeCount / total);

    const authenticSegment = authenticPercentage * circumference;
    const fakeSegment = fakePercentage * circumference;

    return (
        <div className="flex flex-col items-center justify-center p-6 h-full">
            <p className="font-bold text-lg text-gray-800 dark:text-white/90 mb-4">Analysis Breakdown</p>
            <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                    {/* Background Circle */}
                    <circle r={radius} cx="50%" cy="50%" fill="transparent" strokeWidth={strokeWidth} className="stroke-gray-200 dark:stroke-white/10" />

                    {/* Authentic Segment */}
                    {authenticCount > 0 && 
                        <DonutSegment 
                            colorClass="stroke-success" 
                            percentage={authenticPercentage}
                            offset={0}
                            radius={radius}
                            strokeWidth={strokeWidth}
                        />
                    }
                    {/* Fake Segment */}
                    {fakeCount > 0 &&
                        <DonutSegment 
                            colorClass="stroke-danger" 
                            percentage={fakePercentage}
                            offset={-authenticSegment}
                            radius={radius}
                            strokeWidth={strokeWidth}
                        />
                    }
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-gray-800 dark:text-white">{total}</p>
                    <p className="text-sm text-gray-500 dark:text-white/70">Total</p>
                </div>
            </div>
             <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-success"></span>
                    <span className="text-gray-700 dark:text-white/80">Authentic: {authenticCount}</span>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-danger"></span>
                    <span className="text-gray-700 dark:text-white/80">Fake: {fakeCount}</span>
                </div>
            </div>
        </div>
    );
}