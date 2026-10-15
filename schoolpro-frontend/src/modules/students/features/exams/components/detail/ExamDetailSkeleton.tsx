import React from "react";

export const ExamDetailSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 sm:gap-5 pb-12 animate-pulse">
      {/* 1. Header Card Skeleton */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#f0f0f0] shadow-2xs space-y-3">
        {/* Breadcrumb line */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <span className="text-slate-300 text-xs">/</span>
          <div className="h-4 w-28 bg-slate-200 rounded" />
          <span className="text-slate-300 text-xs">/</span>
          <div className="h-4 w-36 bg-slate-200 rounded" />
        </div>

        {/* Title row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full bg-blue-600 inline-block" />
              <div className="h-7 w-64 bg-slate-200 rounded-lg" />
              <div className="h-6 w-20 bg-slate-100 rounded-lg" />
              <div className="h-6 w-24 bg-slate-200 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-4 w-36 bg-slate-100 rounded" />
              <div className="h-4 w-28 bg-slate-100 rounded" />
            </div>
          </div>

          <div className="h-8 w-24 bg-slate-100 border border-slate-200 rounded-lg" />
        </div>
      </div>

      {/* 2. Top Info / Header Card Skeleton */}
      <div className="bg-white rounded-xl border border-[#f0f0f0] p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="h-6 w-1/3 bg-slate-200 rounded" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="h-3 w-20 bg-slate-200 rounded" />
              <div className="h-6 w-16 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Grid Workspace Skeleton: Left Questions & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left questions */}
        <div className="lg:col-span-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#f0f0f0] p-5 sm:p-6 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-slate-200 rounded" />
                <div className="h-5 w-16 bg-slate-100 rounded" />
              </div>
              <div className="h-5 w-4/5 bg-slate-200 rounded" />
              <div className="space-y-2 pt-2">
                <div className="h-10 w-full bg-slate-50 rounded-lg border border-slate-100" />
                <div className="h-10 w-full bg-slate-50 rounded-lg border border-slate-100" />
                <div className="h-10 w-full bg-slate-50 rounded-lg border border-slate-100" />
              </div>
            </div>
          ))}
        </div>

        {/* Right sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-[#f0f0f0] p-5 shadow-2xs space-y-3">
            <div className="h-4 w-28 bg-slate-200 rounded" />
            <div className="h-12 w-full bg-slate-100 rounded-xl" />
            <div className="h-3 w-full bg-slate-200 rounded" />
          </div>
          <div className="bg-white rounded-xl border border-[#f0f0f0] p-5 shadow-2xs space-y-3">
            <div className="h-4 w-32 bg-slate-200 rounded" />
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                <div key={i} className="h-9 rounded-lg bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
