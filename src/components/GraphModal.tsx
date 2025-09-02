import { Dialog, DialogContent } from "@/components/ui/dialog";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import ReactECharts from "echarts-for-react";

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
}

export function GraphModal({ isOpen, onClose, config }: GraphModalProps) {
    console.log("config", config);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] p-0">
          <div className="my-4 w-[95vw] h-[85vh]">
            <ReactECharts
              option={config}
              style={{ height: "100%", width: "100%" }}
              onChartReady={(chart) => {
                  console.log("✅ ECharts chart ready:", chart);
              }}
              onEvents={{
                  click: (params) => {
                      console.log("🔍 Chart clicked:", params);
                },
            }}
            notMerge={true}
            lazyUpdate={true}
            />
          </div>
      </DialogContent>
    </Dialog>
  );
}
