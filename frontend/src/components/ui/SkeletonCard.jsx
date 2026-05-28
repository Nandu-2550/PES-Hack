// Shared glass base for all skeleton cards
const GlassSkeleton = ({ children, className = '' }) => (
  <div
    className={`rounded-2xl overflow-hidden ${className}`}
    style={{
      background: 'rgba(26, 36, 33, 0.42)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 16px 48px rgba(0,0,0,0.28)',
    }}
  >
    {children}
  </div>
);

// Each individual skeleton "bone" runs the glass shimmer wave
const Bone = ({ className = '' }) => (
  <div
    className={`rounded-full shimmer ${className}`}
    style={{ background: 'rgba(255,255,255,0.05)' }}
  />
);

export function SkeletonCard({ rows = 3, showAvatar = false }) {
  return (
    <GlassSkeleton className="p-4 space-y-3">
      {showAvatar && (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full shimmer flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          />
          <div className="flex-1 space-y-2">
            <Bone className="h-3 w-2/3" />
            <Bone className="h-2.5 w-1/3" />
          </div>
        </div>
      )}
      <Bone className="h-4 w-3/4" />
      {Array.from({ length: rows }).map((_, i) => (
        <Bone
          key={i}
          className="h-3"
          style={{ width: `${72 + Math.sin(i) * 20}%` }}
        />
      ))}
      <div className="flex gap-2 pt-1">
        <div className="h-8 w-24 rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-8 w-18 rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
    </GlassSkeleton>
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
    <GlassSkeleton className="p-4 flex gap-4">
      <div className="w-16 h-16 rounded-xl shimmer flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />
      <div className="flex-1 flex flex-col justify-center space-y-2">
        <Bone className="h-4 w-1/2" />
        <Bone className="h-6 w-1/3" />
      </div>
    </GlassSkeleton>
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
    <GlassSkeleton className="p-4 space-y-4">
      <div className="h-32 w-full rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
      <Bone className="h-10 w-1/2" />
      <div className="grid grid-cols-3 gap-2">
        <div className="h-12 rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-12 rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="h-12 rounded-xl shimmer" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
    </GlassSkeleton>
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
