import React from 'react';

interface MenuSkeletonProps {
  count?: number;
  hidePills?: boolean;
  hidePromo?: boolean;
}

export function MenuSkeleton({ count = 3, hidePills = false, hidePromo = true }: MenuSkeletonProps) {
  return (
    <div className="space-y-6 w-full">
      {/* Category Pills Skeleton (Horizontal row) */}
      {!hidePills && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3, 4, 5].map((idx) => (
            <div
              key={idx}
              className="h-9 w-20 sm:w-24 rounded-full bg-slate-200 animate-pulse shrink-0"
            />
          ))}
        </div>
      )}

      {/* Promotion Slider Skeleton (Only if on mobile layout context) */}
      {!hidePromo && (
        <div className="w-full h-[125px] rounded-2xl bg-slate-250 bg-gradient-to-r from-slate-200 to-slate-100 animate-pulse p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-slate-300 rounded-md" />
            <div className="h-5 w-48 bg-slate-300 rounded-md" />
          </div>
          <div className="h-3 w-32 bg-slate-250 bg-slate-300 rounded-md" />
        </div>
      )}

      {/* Main Items Listing Skeleton */}
      <div className="space-y-4">
        {/* Count Label Skeleton */}
        <div className="h-4 w-32 bg-slate-200 animate-pulse rounded-md ml-1" />

        <div className="divide-y divide-slate-100 bg-white rounded-3xl border border-slate-100 shadow-xs p-4 sm:p-6 md:p-8 space-y-6">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className="flex flex-row gap-4 sm:gap-6 justify-between items-start py-6 first:pt-0 last:pb-0"
            >
              {/* Left Details block */}
              <div className="flex-1 space-y-3 min-w-0">
                {/* Veg Tag & Bestseller Badge Skeleton */}
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-slate-200 rounded p-[2px] shrink-0 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  </div>
                  <div className="h-4 w-16 bg-slate-200 rounded-md animate-pulse" />
                </div>

                {/* Title & Price Skeletons */}
                <div className="space-y-2">
                  <div className="h-5 w-3/4 sm:w-1/2 bg-slate-200 rounded-md animate-pulse" />
                  <div className="h-4 w-1/4 bg-slate-100 rounded-md animate-pulse" />
                </div>

                {/* Ratings block Skeleton */}
                <div className="flex items-center gap-3">
                  <div className="h-5 w-10 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded-md animate-pulse" />
                </div>

                {/* Description sentences Skeleton */}
                <div className="space-y-1.5">
                  <div className="h-3 w-5/6 bg-slate-100 rounded-md animate-pulse" />
                  <div className="h-3 w-2/3 bg-slate-100 rounded-md animate-pulse" />
                </div>
              </div>

              {/* Right Image + Out/Add Control block */}
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center p-0.5">
                <div className="w-full h-full rounded-xl sm:rounded-2xl bg-slate-200 animate-pulse border border-slate-100" />
                {/* Button Mock overlay */}
                <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-16 sm:w-24 h-8 bg-slate-100 border border-slate-200 rounded-lg sm:rounded-xl shadow-xs animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
