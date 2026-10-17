import React from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { IconName } from "@/components/ui/Icon";

export interface StudentMetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  iconName: IconName;
  iconBgClass?: string;
  hoverBorderClass?: string;
  onClick?: () => void;
}

/**
 * Standardized single Metric Card across all Student Portal features.
 */
export const StudentMetricCard: React.FC<StudentMetricCardProps> = ({
  title,
  value,
  unit,
  iconName,
  iconBgClass = "bg-blue-50 text-blue-600 border-blue-200",
  hoverBorderClass = "hover:border-blue-400",
  onClick,
}) => {
  return (
    <Card
      className={`rounded-xl shadow-2xs transition-all ${hoverBorderClass} ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate whitespace-nowrap"
          title={title}
        >
          {title}
        </span>
        <span
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${iconBgClass}`}
        >
          <Icon name={iconName} size={17} />
        </span>
      </div>

      <div className="flex items-baseline gap-2 mt-2">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
          {value}
        </span>
        {unit && (
          <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
            {unit}
          </span>
        )}
      </div>
    </Card>
  );
};

/**
 * Shared Loading Skeleton for Metric/Summary cards.
 */
export const StudentMetricSkeleton: React.FC<{ count?: number }> = ({
  count = 4,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="rounded-xl shadow-2xs border-[#f0f0f0]">
          <div className="animate-pulse">
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200/70 shrink-0" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <div className="h-8 sm:h-9 w-14 bg-slate-200 rounded-lg" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
