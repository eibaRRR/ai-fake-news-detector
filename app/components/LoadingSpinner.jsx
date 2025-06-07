export default function LoadingSpinner() {
  return (
    <div className="relative flex flex-col items-center justify-center py-16 px-8 rounded-2xl backdrop-blur-lg bg-white/20 border border-white/30 shadow-lg">
      {/* Glassmorphism background layers */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 to-white/5 mix-blend-overlay"></div>
      <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent from-60% to-white/5"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated spinner with glass effect */}
        <div className="p-2 rounded-full backdrop-blur-sm bg-white/20 border border-white/30">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white/80"></div>
        </div>

        {/* Loading text with better contrast */}
        <p className="mt-6 text-white/90 font-medium drop-shadow-sm">
          Analyzing news content...
        </p>
        <p className="text-sm text-white/70 mt-1 drop-shadow-sm">
          This may take a few moments
        </p>
      </div>
    </div>
  );
}
