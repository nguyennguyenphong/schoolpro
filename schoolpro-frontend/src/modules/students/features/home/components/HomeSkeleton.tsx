import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";
import { Card } from "@/components/ui/Card";

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 1. Banner Skeleton */}
      <div className="h-44 rounded-2xl bg-slate-200 border border-slate-300/80 p-6 flex flex-col justify-between" />

      {/* 2. Functional Cards Skeleton */}
      <div className="space-y-3">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <Card key={idx} className="p-5 border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-slate-200" />
                <div className="w-16 h-5 rounded-full bg-slate-200" />
              </div>
              <div className="h-5 w-3/4 bg-slate-200 rounded-md mb-2" />
              <div className="h-3.5 w-full bg-slate-100 rounded-md mb-1" />
              <div className="h-3.5 w-2/3 bg-slate-100 rounded-md" />
            </Card>
          ))}
        </div>
      </div>

      {/* 3. Reminders Carousel Skeleton */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 bg-slate-200 rounded-md" />
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
            <div className="w-8 h-8 rounded-lg bg-slate-200" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Card key={idx} className="h-56 p-5 border-slate-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="w-24 h-5 bg-slate-200 rounded-md" />
                  <div className="w-16 h-5 bg-slate-200 rounded-full" />
                </div>
                <div className="h-4 w-5/6 bg-slate-200 rounded" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
                <div className="h-3 w-2/3 bg-slate-100 rounded" />
              </div>
              <div className="h-8 w-full bg-slate-200 rounded-lg mt-4" />
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Announcements List Skeleton */}
      <div className="space-y-4">
        <Card className="p-6 border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 w-36 bg-slate-200 rounded-md" />
            <div className="h-4 w-28 bg-slate-200 rounded-md" />
          </div>
          <div className="divide-y divide-slate-100">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0">
                <Skeleton active paragraph={{ rows: 2 }} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
