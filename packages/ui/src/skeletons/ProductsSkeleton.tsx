// components/customer/skeletons/ProductsSkeleton.tsx
export function ProductsSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Filter bar skeleton */}
      <div className="flex gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-gray-200 animate-pulse rounded-full" />
        ))}
      </div>
      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
            <div className="h-36 bg-gray-200 animate-pulse" />
            <div className="p-3 flex flex-col gap-2">
              <div className="h-3 bg-gray-200 animate-pulse rounded w-3/4" />
              <div className="h-3 bg-gray-200 animate-pulse rounded w-1/2" />
              <div className="h-8 bg-gray-200 animate-pulse rounded-xl mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}