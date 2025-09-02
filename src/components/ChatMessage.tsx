import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bot, Edit3, Heart, ThumbsUp, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { MessageContent } from './MessageContent';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import type { Message } from '@/types/chatTypes';

type Role = 'human' | 'ai' | 'user' | 'assistant';
interface MessageTurn {
  role: Role;
  content: string;
}

type ConversationType = MessageTurn[];

interface PayloadType {
conversation?: ConversationType,
timestamp: string;
feedback?: string;
messageId: string;
threadId: string;
platform?: string;

}
interface ChatMessageProps {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  isRemembered?: boolean;
  onEdit?: (newContent: string) => void;
  summary?: string;
  message?: Message
  attachments?: Message['attachments'];
  handleSendYes?: () => void
  isLastAiMessage?: boolean
  hasLiked?: boolean
  echarts_options?: string,
  isSummaryPresent?: boolean
}

export function ChatMessage({ 
  id, 
  content, 
  isUser, 
  timestamp, 
  isRemembered = false, 
  onEdit,
  summary,
  message,
  handleSendYes,
  isLastAiMessage,
  hasLiked,
  isSummaryPresent
}: ChatMessageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [remembering, setRemembering] = useState(false);
  const [learningStatus, setLearningStatus] = useState<'idle' | 'pending' | 'learned'>('idle');
  const { messages, socket, status, platform } = useSocket()
  const { threadId } = useParams();

  const handleEdit = () => {
    if (onEdit) {
      onEdit(editContent);
    }
    setIsEditing(false);
  };

  console.log("isSummaryPresent", isSummaryPresent)

  const handleCancelEdit = () => {
    setEditContent(content);
    setIsEditing(false);
  };


  const handleRemember = () => {
    if (remembering || learningStatus !== 'idle') return;

    const toastId = toast.loading("Learning User Feedback");
    setRemembering(true);

    const currentIndex = messages.findIndex(
      (m) => m.messageId === message.messageId
    );
    const prevMsg = currentIndex > 0 ? messages[currentIndex - 1] : undefined;
    // Build conversation payload
    const firstUserMsg = messages.find((m) => m.role === "user");
    const conversation: ConversationType = [];
    if (firstUserMsg) {
      conversation.push({ role: "human", content: firstUserMsg.content });
    }
    if (prevMsg && prevMsg.role === "assistant") {
      conversation.push({ role: "ai", content: prevMsg.content });
    }
    conversation.push({ role: "human", content: message.content });

    const payload = { conversation, timestamp: message.timestamp };

    if (socket) {
      let eventName: string;
      let payload: PayloadType;

      if (message.node === "ask_python_result_verification") {
        eventName = "python_learning";
        payload = {
          feedback: message.content,
          timestamp: message.timestamp,
          messageId: message.messageId,
          threadId: threadId,
          platform
        };
      } else if (message.node === "ask_for_jql_verification") {
        eventName = "jql_learning";
        payload = {
          conversation,
          timestamp: message.timestamp,
          messageId: message.messageId,
          threadId: threadId,
          platform
        };
      } else {
        eventName = "Generate_learning";
        payload = {
          conversation,
          timestamp: message.timestamp,
          messageId: message.messageId,
          threadId: threadId,
          platform
        };
      }

      if (eventName) {
        console.log(`[Socket Event] Emitting ${eventName}:`, payload);
        socket.emit(eventName, payload, (res: string) => {
          console.log(`[Socket Ack] ${eventName}:`, res);
          toast.dismiss(toastId);
          setRemembering(false);
          // We now wait for the 'Learning_queued' event instead of setting status here
        });
      }
    }
  };
  useEffect(() => {
    if (!socket || !message?.messageId) return;

    const handleLearningQueued = (data: { learning_id: string, timestamp: string }) => {
      if (data.timestamp === message.timestamp) {
        setLearningStatus('pending');
        toast.success("Feedback queued for review!");
      }
    };

    const handleLearningGenerated = (data: { learning_id: string, timestamp: string }) => {
      if (data.timestamp === message.timestamp) {
        setLearningStatus('learned');
        toast.success("Feedback approved and learned!");
      }
    };

    socket.on('Learning_queued', handleLearningQueued);
    socket.on('Learning_generated', handleLearningGenerated);

    return () => {
      socket.off('Learning_queued', handleLearningQueued);
      socket.off('Learning_generated', handleLearningGenerated);
    };
  }, [socket, message?.messageId, message?.timestamp]);
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    try {
      // First, try to parse it as a full date string (like ISO)
      const date = new Date(timeString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }

      // If it's not a valid date, it might be a "HH:MM:SS" string
      const timeParts = timeString.split(':').map(Number);
      if (timeParts.length >= 2 && timeParts.every(p => !isNaN(p))) {
        const [hours, minutes, seconds] = timeParts;
        const today = new Date();
        const timeDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes, seconds || 0);
        return timeDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      }
      
      return "Invalid time";
    } catch (e) {
      return "Invalid time";
    }
  };


  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`flex-1 group relative  ${isUser ? 'max-w-2xl ml-auto' : ''} ${isUser ? 'order-1' : 'order-2'}`}>
        <div className={`px-4 py-3 rounded-xl ${
          isUser 
            ? 'bg-primary text-card-foreground' 
            : 'bg-card text-card-foreground'
        }`}>
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-background/50"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                <Button size="sm" onClick={handleEdit}>Save</Button>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-foreground">
              <MessageContent 
                content={content} 
                isUser={isUser}
                isMini={message?.is_mini}
                isSummaryPresent={false}
              />
            </div>
          )}
        </div>
        
        {(summary || message?.attachments) && (
          <div className="mt-2 px-4 py-3 rounded-xl bg-card text-card-foreground border">
            {summary && (
              <>
                <p className="text-xs font-semibold text-muted-foreground mb-2">Summary</p>
                <MessageContent 
                  content={summary} 
                  isUser={isUser}
                  isMini={false}
                  isSummaryPresent={true}
                />
              </>
            )}
            <MessageContent 
              attachments={message?.attachments}
              isUser={isUser}
              echarts_options={message?.echarts_options}
              isSummaryPresent={false}
            />
          </div>
        )}
        
        <div className={`text-xs text-muted-foreground mt-1 px-2 flex items-center gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
          {onEdit && status.status !== 'processing' && !isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          )}

          {isUser && message.node && (
             <button
              onClick={handleRemember}
              className={`hover:text-primary transition-colors flex items-center gap-1 ${
                learningStatus !== 'idle' ? 'text-primary cursor-not-allowed' : ''
              }`}
              disabled={learningStatus !== 'idle'}
            >
              <Heart className="w-3 h-3" />
              {learningStatus === 'pending' ? 'Pending' : learningStatus === 'learned' ? 'Learned' : 'Remember this'}
            </button>
          )}

          {!isUser && isLastAiMessage && !hasLiked && (
            <button className="hidden group-hover:block transition-opacity duration-200 mt-2" onClick={handleSendYes}>
              <ThumbsUp className="w-5 h-5 text-green-500" />
            </button>
          )}
          
          <span className='mt-2'>{formatTime(timestamp)}</span>
        </div>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 order-2">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}