import type { CSSProperties } from "react";
import type { EChartsOption, ECharts } from "echarts";

export type { EChartsOption, ECharts };

export interface ChartProps {
  option: EChartsOption;
  height?: string | number;
  width?: string | number;
  loading?: boolean;
  style?: CSSProperties;
  className?: string;
  notMerge?: boolean;
  theme?: string | object;
  onChartReady?: (chart: ECharts) => void;
}
