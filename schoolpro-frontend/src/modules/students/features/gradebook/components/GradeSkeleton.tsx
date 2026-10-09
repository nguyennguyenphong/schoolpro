import React from "react";
import { Card } from "@/components/ui/Card";

export const GradeSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white p-5 rounded-2xl border border-[#f0f0f0] space-y-3">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="h-7 w-64 bg-slate-200 rounded" />
        <div className="h-4 w-96 bg-slate-100 rounded" />
      </div>

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

      {/* Table Skeleton */}
      <div className="bg-white border-2 border-slate-300 rounded-xl p-5 space-y-3">
        <div className="h-8 w-full bg-slate-200 rounded" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((j) => (
          <div key={j} className="h-11 w-full bg-slate-100 rounded" />
        ))}
      </div>
    </div>
  );
};
