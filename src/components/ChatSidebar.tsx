import { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, BarChart3, Trash2, ChevronDown } from "lucide-react";
import { generalFunctions } from "@/lib/generalFuntion";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import ThreadSkeleton from "./ui/ThreadSkeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { BrandMenu } from "./BrandMenu";
import { useDeleteThreads, useGetAllThreads } from "@/hooks/use-threads";
import { ThreadTypeDTO } from "@/types/threadType";
import { useGetAllUsers } from "@/hooks/use-users";
import { useSocket } from "@/context/SocketContext";

interface ChatSidebarProps {
  activeThreadId: string | null;
  onThreadSelect: (threadId: string) => void;
  onNewAnalysis: () => void;
}

export function ChatSidebar({
  activeThreadId,
  onThreadSelect,
  onNewAnalysis,
}:
ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userName, setUsername] = useState<string>(() => {
    return localStorage.getItem("name") || "User";
  });
  const { data: usersData } = useGetAllUsers();
  const { data: threadData, isLoading } = useGetAllThreads();
  const { mutate: delThreads } = useDeleteThreads();


  const { threadId } = useParams();
  const [expandedLevel1, setExpandedLevel1] = useState<Set<string>>(new Set());
  const [expandedLevel2, setExpandedLevel2] = useState<
    Record<string, Set<string>>
  >({});
  const { platform } =  useSocket();
  

  const toggleLevel1 = (key: string) => {
    setExpandedLevel1((prev) => {
      const newSet = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      newSet.has(key) ? newSet.delete(key) : newSet.add(key);
      return newSet;
    });
  };

  const toggleLevel2 = (level1: string, level2: string) => {
    setExpandedLevel2((prev) => {
      const levelSet = new Set(prev[level1] || []);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      levelSet.has(level2) ? levelSet.delete(level2) : levelSet.add(level2);
      return {
        ...prev,
        [level1]: levelSet,
      };
    });
  };

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) {
      setUsername(name);
    }
  }, []);

  const filteredThreads = threadData?.filter((thread) =>
    thread.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function onDeleteChat(id: string) {
    delThreads(id,{
      onSuccess: () => {
        toast.success("Conversation deleted successfully!");
      },
      onError: () => {
        toast.error("Failed to delete thread.");
      }
    })
  }

  const normalizeThreads = (threads: ThreadTypeDTO[]): ThreadTypeDTO[] => {
    const validCategories = {
      terra: ["retention", "funnel", "general"],
      game: ["retention", "funnel", "ftue", "general"],
    };

    return threads?.map((thread) => {
      let level1 = thread.title_category_01?.toLowerCase();
      let level2 = thread.title_category_02?.toLowerCase();

      if (!["terra", "game"].includes(level1)) {
        level1 = "terra";
      }

      if (!validCategories[level1].includes(level2)) {
        level2 = "general";
      }

      return {
        ...thread,
        title_category_01: level1,
        title_category_02: level2,
      };
    });
  };

  const groupThreads = (threads: ThreadTypeDTO[]) => {
    return threads?.reduce((acc, thread) => {
      const level1 = thread.title_category_01;
      const level2 = thread.title_category_02;

      if (!acc[level1]) acc[level1] = {};
      if (!acc[level1][level2]) acc[level1][level2] = [];

      acc[level1][level2].push(thread);
      return acc;
    }, {} as Record<string, Record<string, ThreadTypeDTO[]>>);
  };

  const autoExpand: Record<string, string[]> = {
  game: ["funnel"],
  terra: []
};


const normalized = normalizeThreads(filteredThreads);
const groupedThreads = groupThreads(normalized);

useEffect(() => {
  // Safety check in case groupedThreads is empty or undefined
  if (!groupedThreads || Object.keys(groupedThreads).length === 0) return;

  // 1. Expand all level1 keys
  const level1Set = new Set(Object.keys(groupedThreads));

  // 2. Selectively expand level2 based on autoExpand
  const level2Record: Record<string, Set<string>> = {};

  for (const level1 of level1Set) {
    const level2Map = groupedThreads[level1];
    const level2ToExpand = autoExpand[level1] || [];

    for (const level2 of level2ToExpand) {
      if (level2Map?.[level2]) {
        if (!level2Record[level1]) level2Record[level1] = new Set();
        level2Record[level1].add(level2);
      }
    }
  }

  // 3. Set the states
  setExpandedLevel1(level1Set);
  setExpandedLevel2(level2Record);
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [threadData]);


  return (
    <div className="w-80 h-full bg-card/50 backdrop-blur-sm border-r border-border/50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex flex-col gap-3 border-b border-border/50">
      <div className="flex justify-start items-end gap-4">
        <BrandMenu />
        <span className="uppercase text-xs text-muted-foreground pb-1">{platform}</span>
      </div>
        <p className="text-sm text-muted-foreground font-[600] text-[#000] dark:text-[#fff]">
          Hello, {userName}
        </p>

        <Button
          onClick={onNewAnalysis}
          className="w-full bg-gradient-primary hover:shadow-glow text-white mb-4 cyber-glow transition-all duration-smooth"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Analysis
        </Button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-input/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <ThreadSkeleton key={i} />)
          : Object?.entries(groupedThreads || {})?.map(([level1, level2Map]) => (
              <div key={level1} className="mb-2">
                {/* Level 1 */}
                <Collapsible
                  open={expandedLevel1.has(level1)}
                  onOpenChange={() => toggleLevel1(level1)}
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/30 transition-colors">
                    <span className="font-semibold text-foreground">
                      {level1}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedLevel1.has(level1) ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="relative">
                    {/* Vertical line for Level 1 */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border/70"></div>

                    <div className="pl-6 space-y-1">
                      {Object?.entries(level2Map)?.map(([level2, threads]) => (
                        <div key={`${level1}-${level2}`} className="relative">
                          {/* Level 2 */}
                          <Collapsible
                            open={expandedLevel2[level1]?.has(level2)}
                            onOpenChange={() => toggleLevel2(level1, level2)}
                          >
                            {/* Horizontal connector for Level 2 */}
                            <div className="absolute left-4 top-3 w-4 h-px bg-border/70"></div>

                            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-accent/20 transition-colors">
                              <span className="font-medium text-muted-foreground">
                                {level2}
                              </span>
                              <ChevronDown
                                className={`w-3 h-3 transition-transform ${
                                  expandedLevel2[level1]?.has(level2)
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </CollapsibleTrigger>

                            <CollapsibleContent className="relative">
                              {/* Vertical line for Level 2 */}
                              <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60"></div>

                              <div className="pl-6 space-y-1">
                                {/* Level 3 - Threads */}
                                {threads.map((thread) => {
                                  const user = usersData.find(
                                    (u) => u.userId === thread.userId
                                  );
                                  const displayName =
                                    user?.username?.split(" ")[0] || "Unknown";

                                  return (
                                    <div
                                      key={thread.threadId}
                                      className={`group relative rounded-lg cursor-pointer transition-all duration-smooth
                            hover:bg-accent/30 hover:shadow-sm
                            ${
                              activeThreadId === thread.threadId
                                ? "bg-accent/50 border border-primary/30 shadow-glow"
                                : "bg-transparent"
                            }`}
                                    >
                                      {/* Horizontal connector for Level 3 */}
                                      <div className="absolute left-4 top-1/2 w-4 h-px bg-border/60"></div>

                                      <div
                                        onClick={() =>
                                          onThreadSelect(thread.threadId)
                                        }
                                        className="p-3 pr-8"
                                      >
                                        <h3 className="font-medium text-sm text-foreground line-clamp-2">
                                          {thread.title}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                                          <span>{displayName}</span>
                                          <span>
                                            {new Date(
                                              thread.createdAt
                                            ).toLocaleString(undefined, {
                                              day: "numeric",
                                              month: "long",
                                              hour: "numeric",
                                              minute: "2-digit",
                                              hour12: true,
                                            })}
                                          </span>
                                        </div>
                                      </div>

                                      {/* delete button */}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteChat(thread.threadId);
                                          }}
                                          className="absolute top-2 right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                                          >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
      </div>
    </div>
  );
}
