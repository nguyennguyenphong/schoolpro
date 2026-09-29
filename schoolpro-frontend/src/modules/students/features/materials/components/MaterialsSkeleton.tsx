import React from "react";
import { Card } from "@/components/ui/Card";

export const MaterialsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-pulse">
      {/* 1. Header skeleton */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="h-4 w-36 bg-slate-200 rounded" />
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <div className="h-6 w-52 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-72 bg-slate-100 rounded-md" />
          </div>
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
        </div>
      </div>

      {/* 2. Summary cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card key={idx} className="p-3.5 sm:p-4 border-slate-200 rounded-xl h-24 sm:h-28 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-20 bg-slate-200 rounded" />
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-200" />
            </div>
            <div className="h-6 w-14 bg-slate-200 rounded" />
            <div className="h-2.5 w-28 bg-slate-100 rounded" />
          </Card>
        ))}
      </div>

      {/* 3. Filter bar skeleton */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="h-10 w-full bg-slate-100 rounded-lg border border-slate-200" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-9 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>

      {/* 4. Grid cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="p-4.5 border-slate-200 rounded-xl h-64 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-20 bg-slate-200 rounded-md" />
                <div className="h-5 w-16 bg-slate-200 rounded-full" />
              </div>
              <div className="h-5 w-5/6 bg-slate-200 rounded-md mb-2" />
              <div className="h-4 w-full bg-slate-100 rounded-md mb-1" />
              <div className="h-4 w-2/3 bg-slate-100 rounded-md" />
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="h-3.5 w-32 bg-slate-200 rounded" />
              <div className="h-8 w-24 bg-slate-200 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
