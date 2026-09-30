import React from "react";
import { Card } from "@/components/ui/Card";

export const ContactBookSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 sm:space-y-5 animate-pulse">
      {/* 1. Header skeleton */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-7 w-64 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-80 bg-slate-100 rounded-md" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-slate-200 rounded-lg" />
            <div className="h-9 w-28 bg-slate-200 rounded-lg" />
          </div>
        </div>
      </div>

      {/* 2. Summary cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <Card
            key={idx}
            className="p-4 sm:p-5 border-slate-200 rounded-xl h-36 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-slate-200 rounded" />
              <div className="w-9 h-9 rounded-xl bg-slate-200" />
            </div>
            <div className="h-8 w-16 bg-slate-200 rounded" />
            <div className="pt-2 border-t border-slate-100 flex justify-between">
              <div className="h-3 w-28 bg-slate-100 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
          </Card>
        ))}
      </div>

      {/* 3. Filter bar skeleton */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-8 w-28 bg-slate-100 rounded-lg shrink-0" />
          ))}
        </div>
        <div className="h-9 w-full bg-slate-100 rounded-lg border border-slate-200" />
      </div>

      {/* 4. Content cards skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <Card key={idx} className="p-5 border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-5 w-20 bg-slate-200 rounded-full" />
            </div>
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-3/4 bg-slate-100 rounded" />
            <div className="pt-3 border-t border-slate-100 flex justify-between">
              <div className="h-4 w-36 bg-slate-200 rounded" />
              <div className="h-4 w-28 bg-slate-200 rounded" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
