// ChartRenderer.tsx
import React from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

interface ChartRendererProps {
  config: EChartsOption;
}

const ChartRenderer: React.FC<ChartRendererProps> = ({ config }) => {
  console.log("🔍 ChartRenderer received config:", config);
  console.log("🔍 Config type:", typeof config);
  console.log("🔍 Config keys:", config ? Object.keys(config) : "No config");

  if (!config || Object.keys(config).length === 0) {
    console.log("❌ No chart data available");
    return <p>No chart data available</p>;
  }

  // Validate that config has required ECharts structure
  if (!config.series && !config.xAxis && !config.yAxis) {
    console.log("⚠️ Config may not be valid ECharts options:", config);
  }

  console.log("✅ Rendering ECharts with config:", config);

  return (
    <div className="my-4">
      <ReactECharts 
        option={config} 
        style={{ height: "400px", width: "100%" }}
        onChartReady={(chart) => {
          console.log("✅ ECharts chart ready:", chart);
        }}
        onEvents={{
          click: (params) => {
            console.log("🔍 Chart clicked:", params);
          }
        }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};

export default ChartRenderer;
