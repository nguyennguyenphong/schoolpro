import React, { useRef, useEffect } from "react";
import * as echarts from "echarts";
import type { ChartProps, ECharts } from "@/components/ui/Chart/types";
import { chartStyles } from "@/components/ui/Chart/styles";

export const Chart: React.FC<ChartProps> = ({
  option,
  height = 320,
  width = "100%",
  loading = false,
  style,
  className = "",
  notMerge = true,
  theme,
  onChartReady,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ECharts | null>(null);

  // Initialize ECharts instance
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, theme, {
      renderer: "canvas",
    });
    chartInstanceRef.current = chart;

    if (onChartReady) {
      onChartReady(chart);
    }

    // Auto-resize on window resize & container resize
    const handleResize = () => {
      chart.resize();
    };

    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      chart.resize();
    });
    resizeObserver.observe(chartRef.current);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      chart.dispose();
      chartInstanceRef.current = null;
    };
  }, [theme, onChartReady]);

  // Update option
  useEffect(() => {
    if (!chartInstanceRef.current || !option) return;
    chartInstanceRef.current.setOption(option, notMerge);
  }, [option, notMerge]);

  // Update loading state
  useEffect(() => {
    if (!chartInstanceRef.current) return;
    if (loading) {
      chartInstanceRef.current.showLoading({
        text: "Đang tải biểu đồ...",
        color: "#2563eb",
        textColor: "#64748b",
        maskColor: "rgba(255, 255, 255, 0.7)",
      });
    } else {
      chartInstanceRef.current.hideLoading();
    }
  }, [loading]);

  return (
    <div
      ref={chartRef}
      className={`echart-container ${className}`}
      style={{
        ...chartStyles,
        height,
        width,
        ...style,
      }}
    />
  );
};

Chart.displayName = "Chart";
