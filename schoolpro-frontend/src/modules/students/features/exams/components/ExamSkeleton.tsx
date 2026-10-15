import React from "react";

interface ExamSkeletonProps {
  viewMode?: "grid" | "list";
}

export const ExamSkeleton: React.FC<ExamSkeletonProps> = ({ viewMode = "grid" }) => {
  if (viewMode === "list") {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#f0f0f0] p-4 sm:p-5 shadow-2xs animate-pulse flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2.5 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-slate-200 rounded-xl" />
                <div className="h-5 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-24 bg-slate-100 rounded" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
            </div>
            <div className="h-8 w-28 bg-slate-200 rounded-lg shrink-0 self-end sm:self-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-[#f0f0f0] p-4 sm:p-5 shadow-2xs animate-pulse flex flex-col justify-between h-48 space-y-3"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-slate-200 rounded-xl" />
                <div className="h-5 w-16 bg-slate-200 rounded" />
              </div>
              <div className="h-5 w-20 bg-slate-100 rounded-full" />
            </div>
            <div className="h-5 w-4/5 bg-slate-200 rounded" />
            <div className="h-9 w-full bg-slate-50 rounded-lg border border-slate-100" />
            <div className="h-4 w-2/3 bg-slate-100 rounded" />
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-8 w-24 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
