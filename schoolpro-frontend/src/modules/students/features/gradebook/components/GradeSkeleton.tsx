import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

export const GradeSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <Skeleton variant="text" width={220} height={16} />
        <Skeleton variant="text" width={320} height={28} />
        <Skeleton variant="text" width={480} height={16} />
      </div>

      {/* 4 Summary Cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
            <Skeleton variant="text" width={100} height={14} />
            <Skeleton variant="text" width={80} height={32} />
            <Skeleton variant="text" width={140} height={12} />
          </div>
        ))}
      </div>

      {/* Filter skeleton */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <Skeleton variant="text" width="100%" height={38} />
        <div className="flex gap-3 pt-2">
          <Skeleton variant="text" width={120} height={32} />
          <Skeleton variant="text" width={120} height={32} />
          <Skeleton variant="text" width={120} height={32} />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
        <Skeleton variant="text" width="100%" height={40} />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Skeleton key={i} variant="text" width="100%" height={32} />
        ))}
      </div>
    </div>
  );
};
