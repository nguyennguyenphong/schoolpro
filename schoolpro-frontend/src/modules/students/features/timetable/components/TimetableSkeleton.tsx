import React from "react";
import { Card } from "@/components/ui/Card";

export const TimetableSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filter Bar Skeleton */}
      <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-2xs h-28 flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-slate-200 rounded" />
            <div className="h-8 w-44 bg-slate-200 rounded" />
            <div className="h-8 w-36 bg-slate-200 rounded" />
          </div>
          <div className="h-8 w-52 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-5 gap-3 pt-2">
          {[1, 2, 3, 4, 5].map((j) => (
            <div key={j} className="h-8 bg-slate-100 rounded" />
          ))}
        </div>
      </Card>

      {/* Main Grid Skeleton */}
      <Card className="p-4 border border-slate-200 bg-white rounded-xl shadow-2xs h-105 flex flex-col">
        <div className="h-10 w-full bg-slate-100 rounded mb-3" />
        <div className="grid grid-cols-8 gap-2 flex-1">
          <div className="bg-slate-50 rounded" />
          {[1, 2, 3, 4, 5, 6, 7].map((k) => (
            <div key={k} className="space-y-2">
              <div className="h-24 bg-slate-100 rounded" />
              <div className="h-24 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
