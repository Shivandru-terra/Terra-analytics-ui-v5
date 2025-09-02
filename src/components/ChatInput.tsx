import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSendMessage, 
  isLoading = false,
  placeholder = "Ask anything about your data..." 
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const maxHeight = typeof window !== 'undefined' ? window.innerHeight * 0.25 : 200;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      resetHeight();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;

    if (scrollHeight <= maxHeight) {
      textarea.style.height = `${scrollHeight}px`;
      textarea.style.overflowY = 'hidden';
    } else {
      textarea.style.height = `${maxHeight}px`;
      textarea.style.overflowY = 'auto';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [message]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="py-4">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className="
                w-full resize-none border border-border/60 dark:border-border/40 rounded-xl
                bg-background/50 backdrop-blur-sm outline-0
                text-foreground placeholder-muted-foreground
                font-medium text-base leading-relaxed
                focus:outline-0 focus:ring-0 focus:border-border dark:focus:border-border/60
                scrollbar-thin scrollbar-thumb-border
                pr-16 px-4 py-3
              "
              style={{
                minHeight: '96px',
                maxHeight: `${maxHeight}px`,
              }}
            />
            
            <div className="absolute right-2 bottom-4 w-full justify-between flex items-center gap-2 px-3">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-accent/20"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              
              <Button
                type="submit"
                size="sm"
                disabled={!message.trim() || isLoading}
                className="h-8 w-8 p-0 bg-gradient-primary hover:shadow-glow cyber-glow transition-all duration-smooth"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground/70">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isLoading && <span className="text-primary animate-pulse">AI is thinking...</span>}
        </div>
      </form>
    </div>
  );
}