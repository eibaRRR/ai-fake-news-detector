export default function ProgressBar({ progress }) {
  // We only want to show the bar while it's actively loading (between 1% and 99%)
  if (progress < 1 || progress > 99) return null;

  return (
    <div className="w-full bg-white/10 rounded-full h-2.5 my-2 absolute bottom-20 left-0 px-8">
       <p className="text-xs text-center text-white/80 mb-1">{`Reading file... ${progress}%`}</p>
      <div className="w-full bg-gray-600/50 rounded-full h-1.5">
          <div
            className="bg-blue-300 h-1.5 rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          ></div>
      </div>
    </div>
  );
}