import React from "react";
import { Card } from "@/components/ui/Card";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import type { SemesterPerformance } from "@/modules/students/features/dashboard/types";

interface GpaTrendChartProps {
  data: SemesterPerformance[];
}

export const GpaTrendChart: React.FC<GpaTrendChartProps> = ({ data }) => {
  const semesters = data.map((d) => d.semesterName);
  const gpaList = data.map((d) => d.gpa);
  const cpaList = data.map((d) => d.cpa);

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
        type: "cross",
        crossStyle: {
          color: "#94a3b8",
        },
      },
    },
    legend: {
      data: ["GPA Học kỳ", "CPA Tích lũy"],
      top: 0,
      right: 0,
      textStyle: {
        color: "#64748b",
        fontSize: 12,
        fontWeight: 600,
      },
    },
    grid: {
      left: "2%",
      right: "2%",
      bottom: "3%",
      top: "14%",
      containLabel: true,
    },
    xAxis: [
      {
        type: "category",
        data: semesters,
        axisPointer: {
          type: "shadow",
        },
        axisLine: {
          lineStyle: {
            color: "#cbd5e1",
          },
        },
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
          fontWeight: 500,
        },
      },
    ],
    yAxis: [
      {
        type: "value",
        name: "Điểm (Hệ 4)",
        min: 2.5,
        max: 4.0,
        interval: 0.3,
        nameTextStyle: {
          color: "#94a3b8",
          fontSize: 11,
        },
        axisLabel: {
          color: "#64748b",
          fontSize: 11,
          formatter: "{value}",
        },
        splitLine: {
          lineStyle: {
            color: "#f1f5f9",
            type: "dashed",
          },
        },
      },
    ],
    series: [
      {
        name: "GPA Học kỳ",
        type: "bar",
        barWidth: "32%",
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "#3b82f6" },
              { offset: 1, color: "#1d4ed8" },
            ],
          },
        },
        data: gpaList,
      },
      {
        name: "CPA Tích lũy",
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: "#10b981",
        },
        itemStyle: {
          color: "#10b981",
          borderWidth: 2,
          borderColor: "#ffffff",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.25)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.0)" },
            ],
          },
        },
        markLine: {
          silent: true,
          symbol: "none",
          data: [
            {
              yAxis: 3.6,
              lineStyle: {
                color: "#e11d48",
                type: "dashed",
                width: 1.5,
              },
              label: {
                position: "insideEndTop",
                formatter: "Chuẩn Xuất sắc (3.60)",
                color: "#e11d48",
                fontSize: 10,
                fontWeight: "bold",
              },
            },
          ],
        },
        data: cpaList,
      },
    ],
  };

  return (
    <Card className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-1.5 h-4 rounded-full bg-blue-600 inline-block" />
            <h3 className="text-base font-bold text-slate-900 mb-0">
              Diễn biến Điểm Trung bình (GPA & CPA qua các kỳ)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-0">
            Theo dõi xu hướng nâng cao kết quả học tập liên tục qua từng học kỳ
          </p>
        </div>
      </div>

      <Chart option={option} height={320} />
    </Card>
  );
};
