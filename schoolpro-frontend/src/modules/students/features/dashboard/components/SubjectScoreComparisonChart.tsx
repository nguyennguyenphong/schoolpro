import React from "react";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import type { SubjectScoreComparison } from "@/modules/students/features/dashboard/types";

interface SubjectScoreComparisonChartProps {
  data: SubjectScoreComparison[];
}

export const SubjectScoreComparisonChart: React.FC<SubjectScoreComparisonChartProps> = ({
  data,
}) => {
  const subjects = data.map((d) => d.subjectName);
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
      data: ["Điểm Học sinh", "Điểm Bình quân Lớp"],
      top: 0,
      right: 0,
      textStyle: {
        color: "#64748b",
        fontSize: 12,
        fontWeight: 500,
      },
    },
    grid: {
      left: "1%",
      right: "1%",
      bottom: "12%",
      top: "16%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: subjects,
        axisLine: {
          lineStyle: {
            color: "#cbd5e1",
          },
        },
        axisLabel: {
          color: "#475569",
          fontSize: 11,
          interval: 0,
          rotate: 25,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Điểm (Thang 10)",
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
    ],
    series: [
      {
        name: "Điểm Học sinh",
        type: "bar",
        data: studentScores,
        barGap: "20%",
        itemStyle: {
          color: "#2563eb",
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: "top",
          color: "#1d4ed8",
          fontWeight: "bold",
          fontSize: 10,
          formatter: "{c}",
        },
      },
      {
        name: "Điểm Bình quân Lớp",
        type: "bar",
        data: classAverages,
        itemStyle: {
          color: "#94a3b8",
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: false,
        },
      },
    ],
  };

  return (
    <div className="p-4 sm:p-5 border border-[#f0f0f0] bg-white rounded-xl shadow-2xs overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0">
              Phổ Điểm Chi Tiết Từng Môn Học
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-0">
            So sánh điểm trung bình môn của học sinh với mức bình quân tập thể lớp 11A1
          </p>
        </div>
      </div>

      <div className="w-full">
        <Chart option={option} height={320} className="w-full" />
      </div>
    </div>
  );
};
