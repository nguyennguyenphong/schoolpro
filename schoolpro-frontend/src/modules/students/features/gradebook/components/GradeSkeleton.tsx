import React from "react";
import type { GradeViewMode } from "@/modules/students/features/gradebook/types";

interface GradeSkeletonProps {
  viewMode?: GradeViewMode;
}

export const GradeSkeleton: React.FC<GradeSkeletonProps> = ({ viewMode = "table" }) => {
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#f0f0f0] p-4 sm:p-5 shadow-2xs animate-pulse flex flex-col justify-between h-56 space-y-3"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-16 bg-slate-200 rounded-md" />
                  <div className="h-4 w-20 bg-slate-100 rounded" />
                </div>
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
              </div>
              <div className="h-5 w-4/5 bg-slate-200 rounded" />
              <div className="h-12 w-full bg-slate-50 rounded-xl border border-[#f0f0f0]" />
              <div className="h-4 w-2/3 bg-slate-100 rounded" />
            </div>
            <div className="pt-2 border-t border-[#f0f0f0] flex items-center justify-between">
              <div className="h-4 w-24 bg-slate-100 rounded" />
              <div className="h-7 w-28 bg-slate-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#f0f0f0] shadow-2xs overflow-hidden animate-pulse">
      <div className="h-11 bg-slate-100 border-b border-[#f0f0f0] flex items-center px-4 gap-4">
        <div className="h-4 w-10 bg-slate-200 rounded" />
        <div className="h-4 w-40 bg-slate-200 rounded" />
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded" />
        <div className="h-4 w-20 bg-slate-200 rounded ml-auto" />
      </div>
      <div className="divide-y divide-[#f0f0f0]">
        {[1, 2, 3, 4, 5, 6, 7].map((j) => (
          <div key={j} className="h-14 flex items-center px-4 gap-4">
            <div className="h-4 w-6 bg-slate-100 rounded" />
            <div className="space-y-1.5 flex-1 max-w-[200px]">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-20 bg-slate-100 rounded" />
            </div>
            <div className="h-7 w-28 bg-slate-100 rounded" />
            <div className="h-6 w-12 bg-slate-100 rounded" />
            <div className="h-6 w-12 bg-slate-100 rounded" />
            <div className="h-7 w-12 bg-slate-200 rounded" />
            <div className="h-6 w-16 bg-slate-100 rounded ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
};
