import React from "react";
import { Card } from "@/components/ui/Card";

export const HomeSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-44 rounded-xl bg-slate-200 border border-slate-300/80 p-6 flex flex-col justify-between" />

      <div className="space-y-3">
        <div className="h-6 w-48 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, idx) => (
            <Card
              key={idx}
              className="p-5 border-[#f0f0f0] h-full rounded-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-slate-200" />
                <div className="w-16 h-5 rounded-full bg-slate-200" />
              </div>
              <div className="h-6 w-3/4 bg-slate-200 rounded-xl mb-1.5" />
              <div className="h-10 w-full flex flex-col justify-between">
                <div className="h-4 w-full bg-slate-100 rounded-xl" />
                <div className="h-4 w-2/3 bg-slate-100 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
