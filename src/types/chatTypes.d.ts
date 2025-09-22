 interface Message {
  content: string;
  role: string;
  // role: 'user' | 'assistant' | 'system';
  timestamp: string;
  type?: 'text' | 'image' | 'chart' | 'data';
  attachments?: {
    type: 'image' | 'chart' | 'data';
    url?: string;
    data?: File;
    caption?: string;
  }[];
  echarts_options?: Record<string, unknown>;
  node?: string;
  can_edit?: boolean;
  is_system?: boolean;
  is_interrupt?: boolean;
  is_mini?: boolean;
  summary?: string;
  messageId?: string;
  threadId?: string;
  messageContent?: string;
  by?: 'user' | 'ai';
}

interface ServerStatus {
  status:
    | "processing"
    | "initializing"
    | "connected"
    | "disconnected"
    | "error"
    | "reconnecting"
    | "waiting_for_input";
  node?: string;
  phase?: string;
  message?: string;
  sid?: string;
  step?: string;
  current_interruption?: string;
  available_snapshots?: string[];
}

interface MessageFromServerType {
  messageId: string;
  message: string;
  timestamp: string;
  role: "user" | "assistant" | "system";
  is_mini: boolean;
  plots?: PlotType[];
  echarts_options?: Record<string, unknown>;
  summary?: string;
  node?: string;
  is_interrupt?: boolean;
  is_system?: boolean;
}

type PlotType = {
  filename: string;
  data: string;
  type: string;
};

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  status: ServerStatus;
  currentInterruption: string | null;
  sendMessage: (content: string, jumpTo?: string) => void;
  editMessage: (
    messageId: string,
    newContent: string,
    jumpTo?: string,
    timestamp?: string
  ) => void;
  isFirstInteraction: boolean;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsFirstInteraction: React.Dispatch<React.SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setPlatform: React.Dispatch<React.SetStateAction<string | null>>;
  platform: string;
}

type MessageTypes = {
  by: "user" | "ai";
  messageContent: string;
  messageId: string;
  threadId: string;
  timestamp: string;
  summary?: string;
  is_mini?: boolean;
  echarts_options?: Record<string, unknown>;
};

interface MessageTurn {
  role: Role;
  content: string;
}

type ConversationType = MessageTurn[];