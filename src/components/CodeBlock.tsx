import { useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, coy } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Check, Copy, Eye } from 'lucide-react';
import { ContentModal } from './ContentModal';

interface CodeBlockProps {
  code: string;
  language?: string;
  isSummaryPresent?: boolean
}

export function CodeBlock({ code, language = 'javascript', isSummaryPresent }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const { theme } = useTheme();
  const [currentStyle, setCurrentStyle] = useState(vscDarkPlus);
  const [bgColor, setBgColor] = useState('#2d2d2d');
  const [textColor, setTextColor] = useState('white');
  const [showContentModal, setShowContentModal] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      setCurrentStyle(vscDarkPlus);
      setBgColor('#2d2d2d');
      setTextColor('white');
    } else {
      setCurrentStyle(coy);
      setBgColor('#f5f2f0'); // A light, slightly warm background
      setTextColor('black');
    }
  }, [theme]);

  const handleCopy = () => {
    console.log("clicked copy")
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
console.log("isSummaryPresent", isSummaryPresent)
  return (
    <div
      // className="relative my-4 rounded-lg text-sm overflow-x-auto whitespace-nowrap pt-12 border-2 border-red-500"
      className={`relative my-4 rounded-lg text-sm pt-12 ${
    isSummaryPresent ? 'overflow-x-auto whitespace-nowrap' : 'overflow-x-visible whitespace-pre-wrap'
  }`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="absolute top-2 right-2 z-10">
        <Button
          onClick={handleCopy}
          size="sm"
          variant="ghost"
          className="hover:bg-white/10"
          style={{ color: textColor }}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-1" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-1" /> Copy
            </>
          )}
        </Button>
      </div>
      <div className="absolute top-2 left-2 z-10">
        <Button
          size="sm"
          onClick={() => setShowContentModal(true)}
          variant="ghost"
          className="hover:bg-white/10"
          style={{ color: textColor }}
        >
          <Eye className="mr-2 h-4 w-4" />
          View
        </Button>
      </div>
      {isSummaryPresent ? <SyntaxHighlighter
        language={language}
        style={currentStyle}
        wrapLines={false}
        wrapLongLines={false}

        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: 'transparent',
          width: '100%',
          overflowX: isSummaryPresent ? 'auto' : 'visible',
          display: isSummaryPresent ? 'inline-block' : 'block',
          minWidth: isSummaryPresent ? 'max-content' : 'auto',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre',
            wordBreak: 'normal',
          },
        }}
      >
        {code}
      </SyntaxHighlighter> : 
      <SyntaxHighlighter
        language={language}
        style={currentStyle}
        wrapLines={false}
        wrapLongLines={false}
        // wrapLongLines={false}
        customStyle={{
          margin: 0,
          padding: '1rem',
          backgroundColor: 'transparent',
          width: '100%',
          overflowX: isSummaryPresent ? 'auto' : 'visible',
          display: isSummaryPresent ? 'inline-block' : 'block',
          minWidth: isSummaryPresent ? 'max-content' : 'auto',
        }}
        codeTagProps={{
          style: {
            fontFamily: 'var(--font-mono)',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          },
        }}
      >
        {code}
      </SyntaxHighlighter>}
      <ContentModal isOpen={showContentModal} onClose={() => setShowContentModal(false)} config={code}/>
    </div>
  );
} 