import React from "react";
import { Card } from "@/components/ui/Card";

export const AssignmentSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="rounded-xl shadow-2xs h-28 [&>.ant-card-body]:p-4 sm:[&>.ant-card-body]:p-5 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-7 w-24 bg-slate-200 rounded" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-slate-100" />
            </div>
            <div className="h-2 w-32 bg-slate-100 rounded" />
          </Card>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="h-24 bg-white rounded-xl border border-slate-200 p-4" />

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((j) => (
          <div
            key={j}
            className="h-[240px] bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-4 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-48 bg-slate-200 rounded" />
            </div>
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="h-3 w-36 bg-slate-100 rounded" />
              <div className="h-3 w-28 bg-slate-100 rounded" />
              <div className="h-6 w-20 bg-slate-200 rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
