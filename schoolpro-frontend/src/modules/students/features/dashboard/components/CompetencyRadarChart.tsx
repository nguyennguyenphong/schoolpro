import React from "react";
import { Card } from "@/components/ui/Card";
import { Chart } from "@/components/ui/Chart";
import type { EChartsOption } from "@/components/ui/Chart";
import type { CompetencyMetric } from "@/modules/students/features/dashboard/types";

interface CompetencyRadarChartProps {
  data: CompetencyMetric[];
}

export const CompetencyRadarChart: React.FC<CompetencyRadarChartProps> = ({ data }) => {
  const indicators = data.map((d) => ({
    name: d.subject,
    max: d.fullMark,
  }));

  const studentScores = data.map((d) => d.studentScore);
  const facultyScores = data.map((d) => d.facultyAverage);

  const option: EChartsOption = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.9)",
      borderColor: "#334155",
      textStyle: {
        color: "#f8fafc",
        fontSize: 12,
      },
    },
    legend: {
      data: ["Đánh giá Sinh viên", "Trung bình toàn Khoa"],
      bottom: 0,
      icon: "roundRect",
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 16,
      textStyle: {
        color: "#64748b",
        fontSize: 11,
        fontWeight: 600,
      },
    },
    radar: {
      indicator: indicators,
      shape: "polygon",
      splitNumber: 4,
      axisName: {
        color: "#475569",
        fontSize: 11,
        fontWeight: 600,
      },
      splitLine: {
        lineStyle: {
          color: [
            "#e2e8f0",
            "#cbd5e1",
            "#cbd5e1",
            "#94a3b8",
          ].reverse(),
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["#f8fafc", "#ffffff", "#f8fafc", "#ffffff"],
        },
      },
      axisLine: {
        lineStyle: {
          color: "#cbd5e1",
        },
      },
      center: ["50%", "48%"],
      radius: "65%",
    },
    series: [
      {
        name: "Năng lực 360",
        type: "radar",
        data: [
          {
            value: studentScores,
            name: "Đánh giá Sinh viên",
            symbol: "circle",
            symbolSize: 6,
            lineStyle: {
              width: 2.5,
              color: "#3b82f6",
            },
            itemStyle: {
              color: "#3b82f6",
            },
            areaStyle: {
              color: "rgba(59, 130, 246, 0.25)",
            },
          },
          {
            value: facultyScores,
            name: "Trung bình toàn Khoa",
            symbol: "rect",
            symbolSize: 4,
            lineStyle: {
              width: 1.5,
              type: "dashed",
              color: "#94a3b8",
            },
            itemStyle: {
              color: "#94a3b8",
            },
            areaStyle: {
              color: "rgba(148, 163, 184, 0.1)",
            },
          },
        ],
      },
    ],
  };

  return (
    <Card className="p-5 border border-slate-200 bg-white rounded-xl shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-0.5">
          <span className="w-1.5 h-4 rounded-full bg-indigo-600 inline-block" />
          <h3 className="text-base font-bold text-slate-900 mb-0">
            Hồ sơ Năng lực Toàn diện (Radar 360°)
          </h3>
        </div>
        <p className="text-xs text-slate-500 mb-2">
          So sánh năng lực thực tế của sinh viên đối chiếu chuẩn trung bình của khoa
        </p>
      </div>

      <Chart option={option} height={310} />

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
        {data.slice(0, 3).map((item) => (
          <div key={item.subject} className="p-2 bg-slate-50 rounded-lg">
            <span className="text-[11px] text-slate-500 font-medium block truncate">
              {item.subject}
            </span>
            <span className="text-xs font-bold text-blue-600">
              {item.studentScore}/{item.fullMark}
            </span>
            <span className="text-[10px] text-slate-400 block">
              Khoa: {item.facultyAverage}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
