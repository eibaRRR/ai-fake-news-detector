const SkeletonBox = ({ className }) => (
  <div className={`bg-white/10 rounded-lg animate-pulse ${className}`} />
);

export default function SkeletonLoader() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <SkeletonBox className="h-8 w-48" />
        <SkeletonBox className="h-10 w-32" />
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/2 space-y-4">
          {/* Original Input Card */}
          <div className="p-5 backdrop-blur-lg bg-gray-500/10 border border-gray-400/20 rounded-2xl space-y-3">
            <SkeletonBox className="h-6 w-1/2" />
            <SkeletonBox className="h-48 w-full" />
          </div>

          {/* Extracted Text Card */}
          <div className="p-5 backdrop-blur-lg bg-gray-500/10 border border-gray-400/20 rounded-2xl space-y-3">
            <SkeletonBox className="h-6 w-1/3" />
            <div className="space-y-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        <div className="md:w-1/2 space-y-4">
          {/* Authenticity Result Card */}
          <div className="p-5 backdrop-blur-lg bg-gray-500/10 border border-gray-400/20 rounded-2xl space-y-2">
            <SkeletonBox className="h-6 w-2/3" />
            <SkeletonBox className="h-4 w-1/3" />
          </div>

          {/* AI Analysis Card */}
          <div className="p-5 backdrop-blur-lg bg-gray-500/10 border border-gray-400/20 rounded-2xl space-y-3">
            <SkeletonBox className="h-5 w-1/4" />
            <div className="space-y-2">
              <SkeletonBox className="h-4 w-full" />
              <SkeletonBox className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}