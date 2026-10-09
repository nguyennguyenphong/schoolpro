import React from "react";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import type { ClassDistributionItem } from "@/modules/students/features/dashboard/types";

interface ClassRankDistributionChartProps {
  data: ClassDistributionItem[];
  studentRank: number;
}

export const ClassRankDistributionChart: React.FC<ClassRankDistributionChartProps> = ({
  data,
  studentRank,
}) => {
  const chartData = data
    .filter((d) => d.count > 0)
    .map((item) => ({
      name: item.rankName,
      value: item.count,
      itemStyle: { color: item.color },
    }));

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
        fontSize: 12,
      },
      formatter: "{b}: <strong>{c} học sinh</strong> ({d}%)",
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: "#64748b",
        fontSize: 11,
      },
    },
    series: [
      {
        name: "Phân bố học lực",
        type: "pie",
        radius: ["40%", "65%"],
        center: ["50%", "45%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 6,
          borderColor: "#fff",
          borderWidth: 2,
        },
        label: {
          show: true,
          position: "outside",
          formatter: "{b}\n({d}%)",
          fontSize: 10,
          color: "#475569",
        },
        labelLine: {
          length: 6,
          length2: 6,
        },
        data: chartData,
      },
    ],
  };

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs h-full flex flex-col justify-between overflow-hidden">
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-4 rounded-full bg-amber-500 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            Phân Bố Học Lực Lớp 11A1
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-0">
          Vị trí của học sinh: <strong className="text-blue-600 font-semibold">Hạng #{studentRank}</strong> (Nhóm Học sinh Giỏi)
        </p>
      </div>

      <div className="w-full">
        <Chart option={option} height={280} className="w-full" />
      </div>
    </div>
  );
};
