export function SkeletonCard({ rows = 3, showAvatar = false }) {
  return (
    <div className="bg-[#13191C]/75 backdrop-blur-lg border border-white/5 shadow-xl shadow-black/40 rounded-2xl p-4 space-y-3 overflow-hidden">
      {showAvatar && (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-2/3 rounded-full bg-white/5 animate-pulse shimmer" />
            <div className="h-2.5 w-1/3 rounded-full bg-white/5 animate-pulse shimmer" />
          </div>
        </div>
      )}
      <div className="h-4 w-3/4 rounded-full bg-white/5 animate-pulse shimmer" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded-full bg-white/5 animate-pulse shimmer"
          style={{ width: `${70 + Math.sin(i) * 20}%` }}
        />
      ))}
      <div className="flex gap-2 pt-1">
        <div className="h-7 w-20 rounded-lg bg-white/5 animate-pulse shimmer" />
        <div className="h-7 w-16 rounded-lg bg-white/5 animate-pulse shimmer" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3, ...props }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} {...props} />
      ))}
    </div>
  );
}

// Named variants per the detailed SkeletonCard spec
export function SkeletonListingCard() {
  return <SkeletonCard rows={3} showAvatar={true} />;
}

export function SkeletonListingGrid({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonListingCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonPriceCard() {
  return (
    <div className="bg-[#13191C]/75 backdrop-blur-lg border border-white/5 shadow-xl shadow-black/40 rounded-2xl p-4 overflow-hidden flex gap-4">
      <div className="w-16 h-16 rounded-xl bg-white/5 animate-pulse shimmer shrink-0" />
      <div className="flex-1 flex flex-col justify-center space-y-2">
        <div className="h-4 w-1/2 rounded-full bg-white/5 animate-pulse shimmer" />
        <div className="h-6 w-1/3 rounded-full bg-white/5 animate-pulse shimmer" />
      </div>
    </div>
  );
}

export function SkeletonPriceGrid({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonPriceCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonJobCard() {
  return <SkeletonCard rows={2} showAvatar={true} />;
}

export function SkeletonJobGrid({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonJobCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonWeatherCard() {
  return (
    <div className="bg-[#13191C]/75 backdrop-blur-lg border border-white/5 shadow-xl shadow-black/40 rounded-2xl p-4 overflow-hidden space-y-4">
      <div className="h-32 w-full rounded-xl bg-white/5 animate-pulse shimmer" />
      <div className="h-10 w-1/2 rounded-full bg-white/5 animate-pulse shimmer" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 rounded-xl bg-white/5 animate-pulse shimmer" />
        <div className="h-12 rounded-xl bg-white/5 animate-pulse shimmer" />
        <div className="h-12 rounded-xl bg-white/5 animate-pulse shimmer" />
      </div>
    </div>
  );
}

export function SkeletonWeatherGrid({ count = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonWeatherCard key={i} />
      ))}
    </div>
  );
}

export default SkeletonCard;
