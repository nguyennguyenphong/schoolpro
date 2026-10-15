import React from "react";
import { Card } from "@/components/ui/Card";

export const EvaluationSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] space-y-3">
        <div className="h-4 w-48 bg-slate-200 rounded" />
        <div className="flex items-center gap-2">
          <div className="h-7 w-64 bg-slate-200 rounded" />
          <div className="h-5 w-16 bg-slate-100 rounded-full" />
          <div className="h-5 w-24 bg-slate-100 rounded-full" />
        </div>
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

      {/* Tabs Skeleton */}
      <div className="h-10 w-80 bg-slate-200 rounded-lg" />

      {/* Survey Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((j) => (
          <div key={j} className="bg-white border border-[#f0f0f0] rounded-xl p-5 space-y-3 shadow-2xs">
            <div className="flex justify-between items-start">
              <div className="h-5 w-28 bg-slate-200 rounded-full" />
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="h-6 w-3/4 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-2/3 bg-slate-100 rounded" />
            <div className="pt-3 border-t border-[#f0f0f0] flex justify-between items-center">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-8 w-28 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
