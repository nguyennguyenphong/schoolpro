import React from "react";
import { Card } from "@/components/ui/Card";

export const AnnouncementsSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 1. Header skeleton */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="space-y-1.5">
          <div className="h-6 w-48 bg-slate-200 rounded-md" />
          <div className="h-4 w-72 bg-slate-100 rounded-md" />
        </div>
        <div className="h-9 w-32 bg-slate-200 rounded-lg" />
      </div>

      {/* 2. Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="p-4 border-slate-200 rounded-xl h-28 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-200 rounded" />
              <div className="w-10 h-10 rounded-xl bg-slate-200" />
            </div>
            <div className="h-7 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-36 bg-slate-100 rounded" />
          </Card>
        ))}
      </div>

      {/* 3. Filter bar skeleton */}
      <div className="h-24 bg-slate-100 rounded-xl border border-slate-200" />

      {/* 4. Grid cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="p-5 border-slate-200 rounded-xl h-56 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-24 bg-slate-200 rounded-md" />
                <div className="h-5 w-14 bg-slate-200 rounded-full" />
              </div>
              <div className="h-5 w-5/6 bg-slate-200 rounded-md mb-2" />
              <div className="h-4 w-full bg-slate-100 rounded-md mb-1" />
              <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="h-3.5 w-32 bg-slate-200 rounded" />
              <div className="h-3.5 w-20 bg-slate-200 rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
