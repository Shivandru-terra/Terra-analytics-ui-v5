import { Button } from "@/components/ui/button";
import { NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";
import { AlertDialogHeader } from "./ui/alert-dialog";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "./ui/dialog";
import { generalFunctions } from "@/lib/generalFuntion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { useSocket } from "@/context/SocketContext";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type ConversationType = {
  role: "human" | "ai" | "user" | "assistant";
  content: string;
}[];

type LearningItem = {
  learningId: string;
  eventType: string;
  feedback?: string;
  conversation?: ConversationType;
  timestamp: string;
  status: string;
  messageId: string;
  threadId: string;
};

export function LearningQueue() {
  const [learnings, setLearnings] = useState<Record<string, LearningItem[]>>({
    Generate_learning: [],
    jql_learning: [],
    python_learning: [],
  });
  const { socket } = useSocket();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLearnings = async () => {
    try {
      const url = generalFunctions.createUrl("learning-queue");
      setIsLoading(true);
      const res = await fetch(url);
      const data: LearningItem[] = await res.json();

      const grouped = {
        Generate_learning: [],
        jql_learning: [],
        python_learning: [],
      };

      for (const item of data) {
        if (grouped[item.eventType as keyof typeof grouped]) {
          grouped[item.eventType as keyof typeof grouped].push(item);
        }
      }

      setLearnings(grouped);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("Error fetching learnings:", error);
    }
  };

  useEffect(() => {
    fetchLearnings();

    if (!socket) return;

    const handleLearningGenerated = (data: { learning_id: string }) => {
      console.log("[Socket Event] Received Learning_generated:", data);
      setProcessingId(null); // Stop loading indicator
      fetchLearnings();
      toast.success("Learning item approved and removed from queue.");
    };

    socket.on("Learning_generated", handleLearningGenerated);

    return () => {
      socket.off("Learning_generated", handleLearningGenerated);
    };
  }, [socket]);

  function handleApprove(item: LearningItem) {
    setProcessingId(item.learningId);
    const isAdminApproved = true;

    if (!socket) return;

    // Base payload with common properties
    const payload: any = {
      timestamp: item.timestamp,
      messageId: item.messageId,
      threadId: item.threadId,
      isAdminApproved,
      learning_id: item.learningId,
    };

    // Add event-specific properties
    if (item.eventType === "python_learning") {
      payload.feedback = item.feedback;
    } else {
      payload.conversation = item.conversation;
    }

    console.log(
      `[Socket Event] Emitting ${item.eventType} (Admin Approval):`,
      payload
    );
    socket.emit(item.eventType, payload);
  }

  async function handleDeny(item: LearningItem) {
    setProcessingId(item.learningId);
    try {
      const url = generalFunctions.createUrl(`learning/${item.learningId}`);
      console.log(`[API Request] Deleting learning item: ${item.learningId}`);
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      await fetchLearnings();
      console.log(`[API Response] Deleted learning item: ${item.learningId}`);
    } catch (error) {
      console.log("[API Error] Failed to delete learning item:", error);
    } finally {
      setProcessingId(null); // Stop loading indicator
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-9 h-9 p-0 cyber-glow hover:bg-accent/10 transition-all duration-smooth"
          aria-label="Open Learning Queue"
        >
          <NotebookPen className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl w-full max-h-[30rem] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center justify-start gap-4">
            <DialogTitle>Learning Queue</DialogTitle>
            <button onClick={fetchLearnings}>
              <RefreshCcw
                className={cn(
                  "w-4 h-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors",
                  isLoading && "animate-spin"
                )}
              />
            </button>
          </div>
        </AlertDialogHeader>
        <div className="space-y-2 overflow-y-auto max-h-full pr-2">
          <Accordion type="multiple" className="w-full mt-4 space-y-2">
            {Object.entries(learnings).map(([eventType, items]) => (
              <AccordionItem key={eventType} value={eventType}>
                <AccordionTrigger className="capitalize">
                  {eventType.replace("_", " ")} ({items.length})
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-3">
                    {items.map((item) => (
                      <li
                        key={item.learningId}
                        className="p-3 bg-muted rounded-md border text-sm space-y-2"
                      >
                        <div className="font-semibold">
                          {item.feedback ??
                            item.conversation?.[0]?.content ??
                            "No Content"}
                        </div>

                        <div className="text-muted-foreground text-xs">
                          <span>Status: {item.status}</span> |{" "}
                          <span>Time: {item.timestamp}</span>
                        </div>
                        {item.conversation && item.conversation.length > 1 && (
                          <Accordion type="single" collapsible className="pt-2">
                            <AccordionItem value="conversation">
                              <AccordionTrigger className="text-xs">
                                View Full Conversation (
                                {item.conversation.length} messages)
                              </AccordionTrigger>
                              <AccordionContent>
                                <ul className="space-y-2">
                                  {item.conversation.map((msg, idx) => (
                                    <li key={idx}>
                                      <span className="font-medium capitalize">
                                        {msg.role}:
                                      </span>{" "}
                                      <span>{msg.content}</span>
                                    </li>
                                  ))}
                                </ul>
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        )}
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            disabled={processingId === item.learningId}
                            className="px-3 py-1 text-xs rounded-md bg-green-500 text-white hover:bg-green-600"
                            onClick={() => handleApprove(item)}
                          >
                            {processingId === item.learningId
                              ? "Processing..."
                              : "Approve"}
                          </button>
                          <button
                            disabled={processingId === item.learningId}
                            className="px-3 py-1 text-xs rounded-md bg-red-500 text-white hover:bg-red-600"
                            onClick={() => handleDeny(item)}
                          >
                            {processingId === item.learningId
                              ? "Processing..."
                              : "Deny"}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}
