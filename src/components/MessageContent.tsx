import { useState, useRef, useMemo } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Expand, Download, X, Filter, Calendar, GitGraph } from "lucide-react";
import { toast } from "sonner";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";
import { CodeBlock } from "./CodeBlock.tsx";
import { ImageModal } from './ImageModal';
import ChartRenderer from "./ChartRenderer.tsx";
import { GraphModal } from "./GraphModal.tsx";

interface MessageContentProps {
  content?: string;
  isUser: boolean;
  isMini?: boolean;
  attachments?: {
    type: 'image' | 'chart' | 'data';
    url?: string;
    data?: File;
    caption?: string;
  }[];
  echarts_options?: any;
  isSummaryPresent?: boolean;
}

interface TableData {
  headers: string[];
  rows: string[][];
}

interface ChartData {
  type: string;
  chartType: "line" | "bar" | "histogram";
  data: any[];
  title?: string;
  xKey: string;
  yKey: string;
}

export function MessageContent({
  content,
  isUser,
  isMini,
  attachments,
  echarts_options,
  isSummaryPresent
}: MessageContentProps) {
  // const [expandedChart, setExpandedChart] = useState<number | null>(null);
  // const chartRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  // // Chart filter states - moved to component level to fix re-render loop
  // const [chartFilters, setChartFilters] = useState<{
  //   [chartIndex: number]: {
  //     dateRange: [number, number];
  //     visibleFields: { [key: string]: boolean };
  //     yAxisMin: string;
  //     yAxisMax: string;
  //   };
  // }>({});

  const [isMinimized, setIsMinimized] = useState(isMini || false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [ isGraphModalOpen, setIsGraphModalOpen ] = useState(false);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const parseContent = (text: string) => {
    if (!text) return [];

    const sections: any[] = [];
    // Enhanced regex to handle code blocks and surrounding text more robustly
    const blockRegex = /(```[\s\S]*?```)|(\{\s*"type":\s*"chart"[\s\S]*?\})|(<table[\s\S]*?<\/table>)/g;
    
    let lastIndex = 0;
    let match;

    while ((match = blockRegex.exec(text)) !== null) {
      // Text before the block
      if (match.index > lastIndex) {
        sections.push({ type: 'text', content: text.substring(lastIndex, match.index) });
      }

      // Determine block type and add it
      if (match[1]) { // Code block
        const codeMatch = /```(.*?)\n([\s\S]*?)```/.exec(match[1]);
        if (codeMatch) {
            sections.push({
                type: 'code',
                content: { language: codeMatch[1] || 'javascript', code: codeMatch[2].trim() }
            });
        }
      } else if (match[2]) { // Chart
        try {
          const chartData = JSON.parse(match[2]);
          sections.push({ type: 'chart', content: chartData });
        } catch (e) {
            sections.push({ type: 'text', content: match[2] }); // Fallback to text
          }
      } else if (match[3]) { // Table (less common, but good to handle)
        sections.push({ type: 'table_html', content: match[3] });
      }

      lastIndex = match.index + match[0].length;
    }

    // Remaining text
    if (lastIndex < text.length) {
      sections.push({ type: 'text', content: text.substring(lastIndex) });
    }
    
    // If no complex blocks found, treat as single text block
    if (sections.length === 0 && text) {
        sections.push({ type: 'text', content: text });
            }

      return sections;
  };

  const parseLegacyContent = (text: string) => {
    // This function now handles text that does NOT contain code blocks
    const sections: any[] = [];
    let remainingText = text;

    // 1. Extract charts first
    const chartJsonRegex = /\{"type":"chart"[^}]*?\}/g;
    let chartMatch;
    const charts = [];
    while ((chartMatch = chartJsonRegex.exec(remainingText)) !== null) {
      try {
        const chartData = JSON.parse(chartMatch[0]);
        charts.push({
          data: chartData,
          startIndex: chartMatch.index,
          endIndex: chartMatch.index + chartMatch[0].length,
        });
      } catch (e) {
        // Not a valid chart, ignore
      }
    }

    let lastIndex = 0;
    charts.forEach(chart => {
      const textBefore = remainingText.substring(lastIndex, chart.startIndex);
      if (textBefore.trim()) {
        sections.push(...parseTablesAndText(textBefore));
      }
      sections.push({ type: 'chart', content: chart.data });
      lastIndex = chart.endIndex;
    });

    const textAfter = remainingText.substring(lastIndex);
    if (textAfter.trim()) {
      sections.push(...parseTablesAndText(textAfter));
    }

    return sections;
  };
  
  const parseTablesAndText = (text: string) => {
    const sections: any[] = [];
    const lines = text.split('\n');
    let currentTable: string[] | null = null;
    let currentText = '';

    lines.forEach(line => {
      const isTableLine = line.includes('|') && line.split('|').length > 2;

      if (isTableLine) {
        if (currentText.trim()) {
          sections.push({ type: 'text', content: currentText.trim().split('\n') });
          currentText = '';
        }
        if (!currentTable) {
          currentTable = [];
        }
        currentTable.push(line);
      } else {
        if (currentTable) {
          sections.push({ type: 'table', content: currentTable });
          currentTable = null;
        }
        currentText += line + '\n';
      }
    });

    if (currentTable) {
      sections.push({ type: 'table', content: currentTable });
    }
    if (currentText.trim()) {
      sections.push({ type: 'text', content: currentText.trim().split('\n') });
    }

    return sections;
  };

  const parseTableData = (tableLines: string[]): TableData => {
    const rows = tableLines
      .filter((line) => line.trim() && !line.match(/^[\|\s\-]+$/))
      .map((line) =>
        line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell !== "")
      );

    return {
      headers: rows[0] || [],
      rows: rows.slice(1),
    };
  };

  const exportChartAsJPG = async (
    chartElement: HTMLDivElement,
    title: string
  ) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Get the SVG from the chart
      const svgElement = chartElement.querySelector("svg");
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Fill with white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the chart
        ctx.drawImage(img, 0, 0);

        // Convert to blob and download
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${title || "chart"}.jpg`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              toast("Chart exported successfully!");
            }
          },
          "image/jpeg",
          0.9
        );
      };

      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);
      img.src = url;
    } catch (error) {
      toast("Failed to export chart");
    }
  };

  // Expanded Chart Dialog Component with Filters
  const ExpandedChartDialog = ({
    chartData,
    index,
    onClose,
    onExport,
  }: {
    chartData: ChartData;
    index: number;
    onClose: () => void;
    onExport: () => void;
  }) => {
    const [dateRange, setDateRange] = useState<[number, number]>([0, 100]);
    const [visibleFields, setVisibleFields] = useState<{
      [key: string]: boolean;
    }>({});
    const [yAxisMin, setYAxisMin] = useState<string>("");
    const [yAxisMax, setYAxisMax] = useState<string>("");

    // Get all possible data fields for multi-field charts
    const allDataKeys = useMemo(() => {
      if (!chartData.data.length) return [];
      const keys = Object.keys(chartData.data[0]).filter(
        (key) =>
          key !== chartData.xKey && typeof chartData.data[0][key] === "number"
      );
      return keys;
    }, [chartData.data, chartData.xKey]);

    // Initialize visible fields
    useMemo(() => {
      const initialFields: { [key: string]: boolean } = {};
      allDataKeys.forEach((key) => {
        initialFields[key] = key === chartData.yKey; // Only show primary field by default
      });
      setVisibleFields(initialFields);
    }, [allDataKeys, chartData.yKey]);

    // Check if data has date-like fields
    const hasDateField = useMemo(() => {
      if (!chartData.data.length) return false;
      const firstItem = chartData.data[0];
      const xValue = firstItem[chartData.xKey];
      return typeof xValue === "string" && !isNaN(Date.parse(xValue));
    }, [chartData.data, chartData.xKey]);

    // Filter and process data based on current filters
    const filteredData = useMemo(() => {
      let data = [...chartData.data];

      // Apply date range filter if applicable
      if (hasDateField && dateRange) {
        const totalItems = data.length;
        const startIndex = Math.floor((dateRange[0] / 100) * totalItems);
        const endIndex = Math.ceil((dateRange[1] / 100) * totalItems);
        data = data.slice(startIndex, endIndex);
      }

      return data;
    }, [chartData.data, dateRange, hasDateField]);

    // Calculate Y-axis domain
    const yAxisDomain = useMemo(() => {
      if (yAxisMin !== "" && yAxisMax !== "") {
        const min = parseFloat(yAxisMin);
        const max = parseFloat(yAxisMax);
        if (!isNaN(min) && !isNaN(max) && min < max) {
          return [min, max] as [number, number];
        }
      } else if (yAxisMin !== "" && yAxisMax === "") {
        const min = parseFloat(yAxisMin);
        if (!isNaN(min)) {
          return [min, "dataMax"] as [number, string];
        }
      } else if (yAxisMin === "" && yAxisMax !== "") {
        const max = parseFloat(yAxisMax);
        if (!isNaN(max)) {
          return ["dataMin", max] as [string, number];
        }
      }
      return undefined;
    }, [yAxisMin, yAxisMax]);

    const config = useMemo(() => {
      const baseConfig: any = {};
      allDataKeys.forEach((key, idx) => {
        baseConfig[key] = {
          label: key,
          color: `hsl(${(idx * 60) % 360}, 70%, 50%)`,
        };
      });
      return baseConfig;
    }, [allDataKeys]);

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl w-[95vw] h-[90vh] p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {chartData.title || "Chart"}
              <Button size="sm" variant="outline" onClick={onExport}>
                <Download className="w-3 h-3 mr-1" />
                Save
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="flex gap-6 mt-4 h-full">
            {/* Chart Area */}
            <div className="flex-1">
              <div style={{ height: Math.min(window.innerHeight * 0.7, 600) }}>
                <ChartContainer config={config}>
                  <ResponsiveContainer width="100%" height="100%">
                    {chartData.chartType === "line" ? (
                      <LineChart
                        data={filteredData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                      >
                        <XAxis
                          dataKey={chartData.xKey}
                          fontSize={12}
                          tickMargin={10}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          fontSize={12}
                          tickMargin={10}
                          domain={yAxisDomain}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {allDataKeys.map(
                          (key) =>
                            visibleFields[key] && (
                              <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={
                                  config[key]?.color || "hsl(var(--primary))"
                                }
                                strokeWidth={2}
                                dot={{ strokeWidth: 2, r: 3 }}
                                activeDot={{ r: 5, strokeWidth: 2 }}
                              />
                            )
                        )}
                      </LineChart>
                    ) : (
                      <BarChart
                        data={filteredData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                      >
                        <XAxis
                          dataKey={chartData.xKey}
                          fontSize={12}
                          tickMargin={10}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis
                          fontSize={12}
                          tickMargin={10}
                          domain={yAxisDomain}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        {allDataKeys.map(
                          (key) =>
                            visibleFields[key] && (
                              <Bar
                                key={key}
                                dataKey={key}
                                fill={
                                  config[key]?.color || "hsl(var(--primary))"
                                }
                                radius={[2, 2, 0, 0]}
                              />
                            )
                        )}
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Filter Panel */}
            <div className="w-80 border-l pl-6">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4" />
                <h3 className="font-semibold">Filters</h3>
              </div>

              <ScrollArea className="h-full">
                <div className="space-y-6">
                  {/* Date Range Filter */}
                  {hasDateField && (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <Label className="text-sm font-medium">
                            Date Range
                          </Label>
                        </div>
                        <div className="px-2">
                          <Slider
                            value={dateRange}
                            onValueChange={(value) =>
                              setDateRange(value as [number, number])
                            }
                            max={100}
                            min={0}
                            step={1}
                            className="w-full"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>
                              {filteredData.length > 0
                                ? filteredData[0][chartData.xKey]
                                : "Start"}
                            </span>
                            <span>
                              {filteredData.length > 0
                                ? filteredData[filteredData.length - 1][
                                    chartData.xKey
                                  ]
                                : "End"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Field Toggles */}
                  {allDataKeys.length > 1 && (
                    <>
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          Data Fields
                        </Label>
                        <div className="space-y-2">
                          {allDataKeys.map((key) => (
                            <div key={key} className="flex items-center gap-2">
                              <input
                                id={`field-${key}`}
                                type="checkbox"
                                checked={visibleFields[key] || false}
                                onChange={(e) =>
                                  setVisibleFields((prev) => ({
                                    ...prev,
                                    [key]: e.target.checked,
                                  }))
                                }
                                className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-2"
                              />
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    config[key]?.color || "hsl(var(--primary))",
                                }}
                              />
                              <Label
                                className="text-sm cursor-pointer"
                                htmlFor={`field-${key}`}
                              >
                                {key}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Separator />
                    </>
                  )}

                  {/* Y-Axis Controls */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Y-Axis Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label
                          htmlFor="y-min"
                          className="text-xs text-muted-foreground"
                        >
                          Minimum
                        </Label>
                        <Input
                          id="y-min"
                          type="number"
                          placeholder="Auto"
                          value={yAxisMin}
                          onChange={(e) => setYAxisMin(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="y-max"
                          className="text-xs text-muted-foreground"
                        >
                          Maximum
                        </Label>
                        <Input
                          id="y-max"
                          type="number"
                          placeholder="Auto"
                          value={yAxisMax}
                          onChange={(e) => setYAxisMax(e.target.value)}
                          className="h-8"
                        />
                      </div>
                    </div>
                    {(yAxisMin || yAxisMax) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setYAxisMin("");
                          setYAxisMax("");
                        }}
                        className="w-full h-8"
                      >
                        Reset to Auto
                      </Button>
                    )}
                  </div>

                  {/* Chart Info */}
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Chart Info</Label>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Type: {chartData.chartType}</div>
                      <div>Data Points: {filteredData.length}</div>
                      <div>X-Axis: {chartData.xKey}</div>
                      <div>
                        Visible Fields:{" "}
                        {Object.values(visibleFields).filter(Boolean).length}
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // const renderChart = (chartData: ChartData, index: number) => {
  //   console.log("Rendering chart with data:", chartData);
  //   console.log("Chart type detected:", chartData.chartType);

  //   const isExpanded = false; // expandedChart === index; // Commented out
  //   const chartHeight = isExpanded
  //     ? Math.min(window.innerHeight * 0.75, 600)
  //     : 200;

  //   const config = {
  //     [chartData.yKey]: {
  //       label: chartData.yKey,
  //       color: "hsl(var(--primary))",
  //     },
  //   };

  //   const ChartComponent = (
  //     <div
  //       ref={(el) => {
  //         // chartRefs.current[index] = el; // Commented out
  //       }}
  //       style={{ height: chartHeight }}
  //     >
  //       <ChartContainer config={config}>
  //         <ResponsiveContainer width="100%" height="100%">
  //           {chartData.chartType === "line" ? (
  //             <LineChart
  //               data={chartData.data}
  //               margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
  //             >
  //               <XAxis dataKey={chartData.xKey} fontSize={12} tickMargin={10} />
  //               <YAxis fontSize={12} tickMargin={10} />
  //               <ChartTooltip content={<ChartTooltipContent />} />
  //               <Line
  //                 type="monotone"
  //                 dataKey={chartData.yKey}
  //                 stroke="hsl(var(--primary))"
  //                 strokeWidth={3}
  //                 dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
  //                 activeDot={{
  //                   r: 6,
  //                   stroke: "hsl(var(--primary))",
  //                   strokeWidth: 2,
  //                 }}
  //               />
  //             </LineChart>
  //           ) : (
  //             <BarChart
  //               data={chartData.data}
  //               margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
  //             >
  //               <XAxis dataKey={chartData.xKey} fontSize={12} tickMargin={10} />
  //               <YAxis fontSize={12} tickMargin={10} />
  //               <ChartTooltip content={<ChartTooltipContent />} />
  //               <Bar
  //                 dataKey={chartData.yKey}
  //                 fill="hsl(var(--primary))"
  //                 radius={[2, 2, 0, 0]}
  //               />
  //             </BarChart>
  //           )}
  //         </ResponsiveContainer>
  //       </ChartContainer>
  //     </div>
  //   );

  //   return (
  //     <>
  //       <Card key={index} className="my-4 p-4 overflow-hidden">
  //         <div className="flex items-center justify-between mb-4">
  //           {chartData.title && (
  //             <h4 className="font-semibold text-sm truncate mr-4">
  //               {chartData.title}
  //             </h4>
  //           )}
  //           <div className="flex gap-2 flex-shrink-0">
  //             <Button
  //               size="sm"
  //               variant="outline"
  //               // onClick={() => setExpandedChart(index)} // Commented out
  //             >
  //               <Expand className="w-3 h-3 mr-1" />
  //               Expand
  //             </Button>
  //             <Button
  //               size="sm"
  //               variant="outline"
  //               onClick={() => {
  //                 // const chartEl = chartRefs.current[index]; // Commented out
  //                 // if (chartEl) {
  //                   exportChartAsJPG(null, chartData.title || "chart"); // Modified to pass null for chartElement
  //                 // }
  //               }}
  //             >
  //               <Download className="w-3 h-3 mr-1" />
  //               Save
  //             </Button>
  //           </div>
  //         </div>

  //         <div className="w-full overflow-hidden">{ChartComponent}</div>
  //       </Card>

  //       {isExpanded && ( // Commented out
  //         <ExpandedChartDialog
  //           chartData={chartData}
  //           index={index}
  //           onClose={() => {}} // Commented out
  //           onExport={() => {
  //             // const chartEl = chartRefs.current[index]; // Commented out
  //             // if (chartEl) {
  //               exportChartAsJPG(null, chartData.title || "chart"); // Modified to pass null for chartElement
  //             // }
  //           }}
  //         />
  //       )}
  //     </>
  //   );
  // };

  const renderTable = (tableLines: string[], index: number) => {
    const tableData = parseTableData(tableLines);

    return (
      <Card key={index} className="my-4 overflow-x-auto">
        <ScrollArea className="max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                {tableData.headers.map((header, idx) => (
                  <TableHead key={idx} className="font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.rows.map((row, rowIdx) => (
                <TableRow key={rowIdx}>
                  {row.map((cell, cellIdx) => (
                    <TableCell key={cellIdx} className="py-2">
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </Card>
    );
  };

  console.log("isSummaryPresent", isSummaryPresent)
  const renderCodeBlock = (codeContent: { language: string; code: string }, index: number, isSummaryPresent?:boolean) => {
    return (
      <CodeBlock
        key={index}
        language={codeContent.language}
        code={codeContent.code}
        isSummaryPresent={isSummaryPresent}
      />
    );
  };
  
  const renderAttachments = (attachments: MessageContentProps['attachments']) => {
    if (!attachments || attachments.length === 0) return null;
    return (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {attachments.map((att, index) => (
          <button
            key={index}
            onClick={() => handleImageClick(att.url)}
            className="border rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img src={att.url} alt={att.caption} className="w-full h-auto" />
            {att.caption && (
              <p className="text-xs text-muted-foreground p-2">{att.caption}</p>
            )}
          </button>
        ))}
      </div>
    );
  };

  const sections = parseContent(content || "");
  
  // Debug logging for echarts_options
  console.log("🔍 MessageContent received echarts_options:", echarts_options);
  console.log("🔍 echarts_options type:", typeof echarts_options);
  console.log("🔍 echarts_options value:", echarts_options);
  
  function handleMinimize() {
    setIsMinimized((prev) => !prev);
  }

  return (
    <>
    <div className="prose prose-sm max-w-none overflow-x-auto dark:prose-invert">
      {!isUser && isMini && content && (
        <>
          <button
            onClick={handleMinimize}
            className="dark:bg-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors px-2 py-1 rounded-md absolute right-0 top-[0] cursor-pointer z-50"
          >
            {isMinimized ? (
              <img
                src="/maximize-arrow.svg"
                alt="maximize-arrow"
                className="w-5 h-5"
              />
            ) : (
              <img
                src="/minimize-arrow.svg"
                alt="minimize-arrow.png"
                className="w-5 h-5"
              />
            )}
          </button>
        </>
      )}
        
        <div
          className={`transition-all duration-300 max-w-4xl ${
            isMinimized ? "max-h-20 opacity-50 overflow-hidden" : "max-h-full opacity-100"
          }`}
        >
          {renderAttachments(attachments)}
      {sections?.map((section, index) => {
        switch (section.type) {
          case "table":
            return renderTable(section.content as string[], index);
          case "chart":
                // return renderChart(section.content as ChartData, index); // Commented out
                return null;
              case "code":
                return renderCodeBlock(section.content as { language: string; code: string }, index, isSummaryPresent);
              case "text":
            return (
                  <div key={index} className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        p: ({node, ...props}) => <p className="my-1 leading-relaxed" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                      }}
              >
                      {section.content as string}
                    </ReactMarkdown>
              </div>
            );
              default:
                return null;
        }
      })}
    </div>
    { echarts_options && Object.keys(echarts_options ?? {})?.length > 0 && (() => {
        const config = typeof echarts_options === 'string' 
          ? (() => {
              try {
                return JSON.parse(echarts_options);
              } catch (error) {
                console.error("❌ Failed to parse echarts_options JSON:", error);
                return null;
              }
            })()
          : echarts_options;
        
        return config ? 
        <div className="flex flex-col">
        { Object.keys(echarts_options ?? {})?.length > 0 &&
        <>
        <ChartRenderer config={config} />
         <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => setIsGraphModalOpen(true)}
        >
          <GitGraph className="w-4 h-4 mr-1" />
          View Full Graph 
          </Button>
          </>}
        </div>
        : null;
      })() }
      </div>
      <ImageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        imageUrl={selectedImageUrl}
      />
      {Object.keys(echarts_options ?? {})?.length > 0 && <GraphModal isOpen={isGraphModalOpen} onClose={()=> setIsGraphModalOpen((prev) => !prev)} config={typeof echarts_options === 'string' ? JSON.parse(echarts_options) : echarts_options} /> 
      }
    </>
  );
}
