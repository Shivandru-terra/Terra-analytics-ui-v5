import { Dialog, DialogContent } from "@/components/ui/dialog";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import ReactECharts from "echarts-for-react";

// import SyntaxHighlighter from "react-syntax-highlighter";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  coy,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

interface ContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: any;
}

export function ContentModal({ isOpen, onClose, config }: ContentModalProps) {
  const { theme } = useTheme();
  const [currentStyle, setCurrentStyle] = useState(vscDarkPlus);
  const [bgColor, setBgColor] = useState("#2d2d2d");
  const [textColor, setTextColor] = useState("white");
  console.log("config", config);
  useEffect(() => {
      if (theme === 'dark') {
        setCurrentStyle(vscDarkPlus);
        setBgColor('#2d2d2d');
        setTextColor('white');
      } else {
        setCurrentStyle(coy);
        setBgColor('#f5f2f0');
        setTextColor('black');
      }
    }, [theme]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto p-0"
      style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="my-4 w-[95vw] h-[85vh]" >
          <SyntaxHighlighter
            language={"javascript"}
            style={currentStyle}
            wrapLines={false}
            wrapLongLines={false}
            customStyle={{
              margin: 0,
              padding: "1rem",
              backgroundColor: "transparent",
              width: "100%",
              overflowX: "auto",
              display: "inline-block",
              minWidth: "max-content",
            }}
            codeTagProps={{
              style: {
                fontFamily: "var(--font-mono)",
                whiteSpace: "pre",
                wordBreak: "normal",
              },
            }}
          >
            {config}
          </SyntaxHighlighter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
