import React from "react";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import type { SubjectGroupPerformance } from "@/modules/students/features/dashboard/types";

interface SubjectGroupChartProps {
  data: SubjectGroupPerformance[];
}

export const SubjectGroupChart: React.FC<SubjectGroupChartProps> = ({ data }) => {
  const groups = data.map((d) => d.groupName);
  const studentScores = data.map((d) => d.studentScore);
  const classAverages = data.map((d) => d.classAverage);

  const option: EChartsOption = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
        fontSize: 12,
      },
      axisPointer: {
        type: "shadow",
      },
    },
    legend: {
      data: ["Điểm Học sinh", "Bình quân Lớp"],
      top: 0,
      right: 0,
      textStyle: {
        color: "#64748b",
        fontSize: 11,
        fontWeight: 500,
      },
    },
    grid: {
      left: "1%",
      right: "6%",
      bottom: "3%",
      top: "16%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      min: 6,
      max: 10,
      interval: 1,
      axisLabel: {
        color: "#64748b",
        fontSize: 11,
      },
      splitLine: {
        lineStyle: {
          type: "dashed",
          color: "#f1f5f9",
        },
      },
    },
    yAxis: {
      type: "category",
      data: groups,
      axisLine: {
        lineStyle: {
          color: "#cbd5e1",
        },
      },
      axisLabel: {
        color: "#475569",
        fontSize: 11,
        fontWeight: 500,
      },
    },
    series: [
      {
        name: "Điểm Học sinh",
        type: "bar",
        data: studentScores,
        itemStyle: {
          color: "#10b981",
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: "right",
          color: "#047857",
          fontWeight: "bold",
          fontSize: 11,
          formatter: "{c}",
        },
      },
      {
        name: "Bình quân Lớp",
        type: "bar",
        data: classAverages,
        itemStyle: {
          color: "#94a3b8",
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: "right",
          color: "#475569",
          fontSize: 11,
          formatter: "{c}",
        },
      },
    ],
  };

  return (
    <div className="p-4 sm:p-5 border border-slate-200 bg-white rounded-xl shadow-2xs h-full flex flex-col justify-between overflow-hidden">
      <div className="mb-2">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-4 rounded-full bg-emerald-600 inline-block" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
            Năng lực theo Khối môn
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-0">
          Tự nhiên, Xã hội và Ngoại ngữ
        </p>
      </div>

      <div className="w-full">
        <Chart option={option} height={280} className="w-full" />
      </div>
    </div>
  );
};

export const CreditDistributionChart = SubjectGroupChart;
