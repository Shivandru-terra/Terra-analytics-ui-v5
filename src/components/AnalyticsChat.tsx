import { useSocket } from '@/context/SocketContext';
import { useCreateThread } from '@/hooks/use-threads';
import { generalFunctions } from '@/lib/generalFuntion';
import { Bot } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { ChatPiping } from './ChatPiping';
import { ChatSidebar } from './ChatSidebar';
import { LearningQueue } from './LearningQueue';
import { ThemeToggle } from './ThemeToggle';

export function AnalyticsChat() {
  const navigate = useNavigate();
  const { threadId } = useParams();
  const [activeThreadId, setActiveThreadId] = useState<string | null>(threadId || "");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [rememberedMessages, setRememberedMessages] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const userId = generalFunctions.getUserId();
  const { messages, sendMessage, status, socket, editMessage, platform } = useSocket();
  const {mutate: createThread} = useCreateThread()
  const [hasLiked, setHasLiked] = useState(false);
  const isLoading = status.status === 'processing';


  const handleNewAnalysis = async () => {
    const newThreadId = `t-${uuidv4()}`;
    navigate(`/dashboard/${newThreadId}`);
    const payload = {
      threadId: newThreadId,
      platform
    }

    createThread(payload, {
      onSuccess: () => {
        setActiveThreadId(newThreadId);
        setHasStartedChat(false);
      },
      onError: () => {
        toast.error('Failed to create thread');
      }
    })
  };

  useEffect(() => {
    if (!activeThreadId) {
      handleNewAnalysis();
    }
  }, [activeThreadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    if(messages?.length === 0){
      setHasStartedChat(false);
    }else{
      setHasStartedChat(true);
    }
  }, [messages, isLoading]);

  console.log("status testing", status);


  const safeStage = status?.step || status?.status || "" ;

  console.log("safe stage", safeStage);


  const handleThreadSelect = (threadId: string) => {
    setActiveThreadId(threadId);
    navigate(`/dashboard/${threadId}`);
  };

  const handleSendMessage = async (content: string) => {
    if (content.trim().length === 0) return;
    console.log("📤 Sending message from chat interface:", { content, threadId });
    sendMessage(content);
    setHasStartedChat(true);
    scrollToBottom();
  };

  const handleSendYes = async () => {
    sendMessage("yes");
    scrollToBottom();
    setHasStartedChat(true);
  }

  
const getValidISOString = (input: unknown): string => {
  const date = new Date(input as string);
  return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
};
  const handleEditMessage = (messageId: string, newContent: string, jumpTo?: string, timestamp?: string) => {
    const isoTime = getValidISOString(timestamp);
    editMessage(messageId, newContent, "True" , isoTime);
    toast.success("Editing...!");
  };

  console.log("messages from analytics chat", messages);

  return (
    <div className="h-screen bg-gradient-bg flex">
      {/* Header */}
      <div className="fixed top-0 right-0 z-50 p-4">
        {/* {(userId === "u-923f0553-2728-4545-9f95-80dd29c74537" || userId === "u-2b334b0d-a6ba-4730-949b-f29f201987a2" || userId === "u-7ca18dfc-85bf-4653-a19f-a6555c0e04f5") && <LearningQueue />} */}
        <ThemeToggle />
      </div>
      
      <ChatSidebar
        activeThreadId={activeThreadId}
        onThreadSelect={handleThreadSelect}
        onNewAnalysis={handleNewAnalysis}
      />
      
      <div className="flex-1 flex flex-col">
        
         { hasStartedChat ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4 no-scrollbar">
              <div className="flex-1 max-w-4xl mx-auto space-y-4">
                {messages.map((message, index) => (
                  <div key={message.messageId}>
                    <ChatMessage
                    key={message.messageId}
                    id={message.messageId}
                    content={message.content}
                    isUser={message.role === 'user'}
                    timestamp={message.timestamp}
                    isRemembered={rememberedMessages.has(message.messageId)}
                    isLastAiMessage={index === messages.length - 1 && message.role !== 'user'}
                    onEdit={message.role === 'user' ? (newContent) => handleEditMessage(message.messageId, newContent, message.node, message.timestamp) : undefined}
                    summary={message?.summary}
                    message={message}
                    handleSendYes={handleSendYes}
                    hasLiked={hasLiked}
                    isSummaryPresent={Boolean(message.summary?.trim())}
                  />
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <span>Thinking</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                        <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>
            {/* Input */}
            <div className="px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <ChatInput 
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-5xl w-full">
              <div className="mb-12">
                <h1 className="text-6xl font-bold mb-6 text-glow bg-gradient-primary bg-clip-text text-transparent animate-glow">
                  Analytics AI
                </h1>
                <p className="text-2xl text-muted-foreground mb-12 font-light">
                  Ask questions, get insights, make data-driven decisions
                </p>
              </div>
              
              <div className="max-w-4xl mx-auto">
                <ChatInput 
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  placeholder="What would you like to analyze today?"
                />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* {hasStartedChat && <ChatPiping currentStage={safeStage} />} */}
      <ChatPiping currentStage={safeStage} />
    </div>
  );
}