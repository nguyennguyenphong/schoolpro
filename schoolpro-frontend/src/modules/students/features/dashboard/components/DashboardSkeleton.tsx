import React from "react";
import { Card } from "@/components/ui/Card";

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="space-y-5 animate-pulse">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="p-4 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs h-28 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-7 w-28 bg-slate-200 rounded" />
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100" />
            </div>
            <div className="h-2 w-36 bg-slate-100 rounded" />
          </Card>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs h-[390px] flex flex-col justify-between">
            <div className="h-5 w-64 bg-slate-200 rounded mb-2" />
            <div className="flex-1 bg-slate-100 rounded-lg my-2" />
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs h-[390px] flex flex-col justify-between">
            <div className="h-5 w-48 bg-slate-200 rounded mb-2" />
            <div className="flex-1 bg-slate-100 rounded-lg my-2" />
          </Card>
        </div>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs h-[380px] flex flex-col justify-between">
          <div className="h-5 w-52 bg-slate-200 rounded mb-2" />
          <div className="flex-1 bg-slate-100 rounded-lg my-2" />
        </Card>
        <Card className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs h-[380px] flex flex-col justify-between">
          <div className="h-5 w-52 bg-slate-200 rounded mb-2" />
          <div className="flex-1 bg-slate-100 rounded-lg my-2" />
        </Card>
      </div>

      {/* Table Skeleton */}
      <Card className="p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs h-64">
        <div className="h-5 w-48 bg-slate-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((j) => (
            <div key={j} className="h-8 bg-slate-100 rounded w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
};
