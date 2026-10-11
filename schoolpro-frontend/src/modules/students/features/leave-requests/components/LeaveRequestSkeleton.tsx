import React from "react";
import { Card } from "@/components/ui/Card";

export const LeaveRequestSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card
          key={i}
          loading={true}
          className="rounded-xl shadow-2xs border-[#f0f0f0] h-60"
          skeletonProps={{
            paragraph: { rows: 4 },
          }}
        />
      ))}
    </div>
  );
};
