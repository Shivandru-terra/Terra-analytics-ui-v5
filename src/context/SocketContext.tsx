import { formatISTTime } from "@/lib/utils";
import { generalFunctions } from "@/lib/generalFuntion";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation } from "react-router-dom";
import { Socket } from "socket.io-client";
import { useSocketHandle } from "./useSocketHandle";
import { v4 as uuidv4 } from "uuid";
import { useMessages } from "@/hooks/use-threads";

// --- Context ---
const SocketContext = createContext<SocketContextType | undefined>(undefined);

// --- Provider ---
interface SocketProviderProps {
  children: ReactNode;
}

const SOCKET_URL = generalFunctions.baseUrl;

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const location = useLocation();

  useEffect(() => {
    const pathParts = location.pathname.split("/");
    const newThreadId = pathParts[2] || null;
    setThreadId(newThreadId);
    console.log("🔄 Updated threadId:", newThreadId);
  }, [location.pathname]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [status, setStatus] = useState<ServerStatus>({
    status: "initializing",
  });
  const [currentInterruption, setCurrentInterruption] = useState<string | null>(
    null
  );
  const [isFirstInteraction, setIsFirstInteraction] = useState(false);
  const [platform, setPlatform] = useState<string | null>("terra");
  const userId = generalFunctions.getUserId();
  const socket = useSocketHandle(userId, threadId, platform, SOCKET_URL);
  const [isLoading, setIsLoading] = useState(false);
  const { data: threadMessages } = useMessages(threadId);

  console.log("threadMessages from react query", threadMessages);

  

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("Connected to server! SID:", socket.id);
      // setStatus({ status: "connected", sid: socket.id });
    };

    const handleDisconnect = (reason: Socket.DisconnectReason) => {
      console.log("Disconnected from server. Reason:", reason);
      // setStatus({ status: "disconnected", message: reason });
    };

    const handleConnectError = (error: Error) => {
      console.log("Connection error:", error);
      // setStatus({ status: "error", message: error.message });
    };

    const handleReconnectAttempt = (attemptNumber: number) => {
      console.log("Reconnection attempt", attemptNumber);
      // setStatus({
      //   status: "reconnecting",
      //   message: `Attempt ${attemptNumber}`,
      // });
    };

    const handleServerStatus = (data: ServerStatus) => {
      console.log("Server status:", data);
      setStatus({
        status: data.status,
        node: data.node,
        phase: data.phase,
        sid: socket.id,
        step: data.step,
        current_interruption: data.current_interruption,
      });

      // Handle waiting_for_input status - make messages editable
      if (data.status === "waiting_for_input") {
        setCurrentInterruption(data.current_interruption);
        console.log(`📍 Now at interruption: ${data.current_interruption}`);

        // Make all user messages that have node associations editable
        setMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            can_edit: msg.role === "user" && msg.node ? true : msg.can_edit,
          }))
        );
      }
    };
    console.log("Server status 2", status)
    const handleServerMessage = (data: MessageFromServerType) => {
      console.log("🔍 Message from server:", data);
      console.log("🔍 Data type:", typeof data);
      console.log("🔍 Data keys:", Object.keys(data));

      // Handle plots if they exist
      let attachments: {
        type: "image" | "chart" | "data";
        url?: string;
        data?: File;
        caption?: string;
      }[] = [];

      // Enhanced debugging for plots
      console.log("🔍 Checking for plots...");
      console.log("🔍 data.plots exists:", !!data.plots);
      console.log("🔍 data.plots type:", typeof data.plots);
      console.log("🔍 data.plots value:", data.plots);

      if (data.plots && data.plots.length > 0) {
        console.log("✅ Processing plots:", data.plots.length);
        console.log("🔍 First plot structure:", data.plots[0]);

        attachments = data.plots.map((plot: PlotType, index: number) => {
          console.log(`🔍 Processing plot ${index}:`, {
            filename: plot.filename,
            type: plot.type,
            dataLength: plot.data ? plot.data.length : 0,
          });

          return {
            type: "image" as const,
            url: `data:${plot.type};base64,${plot.data}`,
            caption: plot.filename,
          };
        });

        console.log("✅ Created attachments:", attachments);
      } else {
        console.log("❌ No plots found in message");
      }

      // Handle ECharts options if they exist
      // console.log("🔍 Checking for echarts_options...");
      // console.log("🔍 data.echarts_options exists:", !!data.echarts_options);
      // console.log("🔍 data.echarts_options type:", typeof data.echarts_options);
      // console.log("🔍 data.echarts_options value:", data.echarts_options);

      if (data.message != "Welcome back! Resuming your session.") {
        const newMessage: Message = {
          messageId: data?.messageId,
          content: data.message,
          role: "assistant",
          timestamp: formatISTTime(data.timestamp || new Date()),
          node: data.node,
          is_system: data.is_system,
          is_interrupt: data.is_interrupt,
          attachments: attachments.length > 0 ? attachments : undefined,
          echarts_options: data.echarts_options,
          is_mini: data.is_mini || false,
          summary: data.summary || ""
        };

        // console.log("🔍 Final message object:", newMessage);
        // console.log("🔍 Message has attachments:", !!newMessage.attachments);
        // console.log("🔍 Message has echarts_options:", !!newMessage.echarts_options);

        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }

      // Update status back to connected when we receive a non-system message
      if (!data.is_system) {
        // setStatus({ status: "connected", sid: socket.id });
      }
    };
    const handleServerResults = (data: {
      results: { type: string; data: string; title: string }[];
    }) => {
      if (data && data.results) {
        console.log("Received server_results:", data);
        // setStatus({ status: "processing", phase: "rendering_results" });

        const attachments = data.results.map((result) => ({
          type: (result.type === "image"
            ? "image"
            : result.type === "chart"
            ? "chart"
            : "data") as "image" | "chart" | "data",
          url: result.type === "image" ? result.data : undefined,
          data:
            result.type !== "image"
              ? (result.data as unknown as File)
              : undefined,
          caption: result.title,
        }));

        const newMessage: Message = {
          messageId: `m-${uuidv4()}`,
          role: "assistant",
          content:
            attachments.length > 0
              ? "Here are the results of your query:"
              : "The query executed successfully.",
          timestamp: formatISTTime(new Date()),
          attachments: attachments
        };
        const introMessage =
          "We were at: Hello! I am your Mixpanel AI assistant. Please provide your analytics query.";
        if (newMessage.content.trim() === introMessage) {
          console.log("⏩ Skipping default intro message.");
          return;
        }

        setMessages((prev) => [...prev, newMessage]);

        // setStatus({ status: "connected" });
      }
    };
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("reconnect_attempt", handleReconnectAttempt);
    socket.on("server_status", handleServerStatus);
    socket.on("server_message", handleServerMessage);
    socket.on("server_results", handleServerResults);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("reconnect_attempt", handleReconnectAttempt);
      socket.off("server_status", handleServerStatus);
      socket.off("server_message", handleServerMessage);
      socket.off("server_results", handleServerResults);
    };
  }, [socket]);

  const sendMessage = (content: string, jumpTo?: string) => {
    if (socket && content) {
      console.log("📤 Sending message: from socket", {
        content,
        threadId,
        userId,
        jumpTo,
        socket,
      });
      const userMessage: Message = {
        messageId: `m-${uuidv4()}`,
        content: content,
        role: "user",
        timestamp: formatISTTime(new Date()),
        node: currentInterruption || undefined, // Associate with current interruption
      };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      // Send either regular message or jump request
      if (jumpTo) {
        console.log("📤 Sending jump message with threadId:", threadId, messages);
        socket.emit("user_message", {
          message: content,
          userId,
          threadId,
          jump_to: jumpTo,
          messageId: userMessage.messageId,
        });
      } else {
        console.log("📤 Sending regular message with threadId:", threadId);
        socket.emit("user_message", {
          message: content,
          userId,
          threadId,
          messageId: userMessage.messageId,
        });
      }

      // Clear current interruption since we've sent a response
      setCurrentInterruption(null);
    }
  };

  useEffect(() => {
          const transformedMessages = threadMessages?.map((msg: Message) => ({
          messageId: msg.messageId,
          content: msg.messageContent,
          role: msg.by === "ai" ? "assistant" : "user",
          timestamp: formatISTTime(msg.timestamp),
          summary: msg.summary,
          is_mini: msg.is_mini,
          echarts_options: msg.echarts_options
        }));
        setMessages(transformedMessages || []);
  }, [threadId, threadMessages]);

  const editMessage = (
    messageId: string,
    newContent: string,
    jumpTo?: string,
    timestamp?: string
  ) => {
    setIsLoading(true);
    console.log("messageId on edit", messageId);
    const index = messages.findIndex((msg) => msg.messageId === messageId);
    if (index === -1) return;
    const messagesToDelete = messages.slice(index + 1); // after the edited message
    const messageIdsToDelete = messagesToDelete.map((msg) => msg.messageId);
    const url = generalFunctions.createUrl(`messages/delete-batch`);
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageIds: messageIdsToDelete }),
    });
    if (socket && newContent && jumpTo && threadId) {
      const messageIndex = messages.findIndex(
        (msg) => msg.messageId === messageId
      );

      if (messageIndex !== -1) {
        // 1. Truncate the history up to the message being edited.
        const newHistory = messages.slice(0, messageIndex);

        // 2. Create a new user message to represent the edit.
        const editedUserMessage: Message = {
          messageId,
          content: newContent,
          role: "user",
          timestamp: formatISTTime(timestamp),
          node: jumpTo,
        };

        // 3. Update the messages state with the new, shorter history + new message.
        setMessages([...newHistory, editedUserMessage]);

        // 4. Send the jump request to the backend.
        console.log(
          "📤 Sending edit message with threadId:",
          threadId,
          timestamp
        );
        socket.emit("user_message", {
          message: newContent,
          userId,
          threadId,
          jump_to: jumpTo,
          messageId,
          timestamp,
        });

        // 5. Clear any interruption state, as we've now acted on it.
        setCurrentInterruption(null);
      }
    }
    setIsLoading(false);
  };

  const value = {
    socket,
    messages,
    status,
    currentInterruption,
    sendMessage,
    editMessage,
    isFirstInteraction,
    setMessages,
    setIsFirstInteraction,
    isLoading,
    setIsLoading,
    setPlatform,
    platform
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

// --- Hook ---
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
