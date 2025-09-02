import { generalFunctions } from "@/lib/generalFuntion";
import { createContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { useLocation } from "react-router-dom";
import { useInfiniteQuery, useQuery, QueryFunctionContext  } from '@tanstack/react-query';
import { fetchUsers, fetchThreadPreview } from "@/api/fetch";

export const AppContext = createContext(undefined);

type ThreadType = {
  createdAt: string;
  num_of_msgs: number;
  threadId: string;
  title: string;
  userId: string;
}

export default function AppContextProvider({ children }) {
const location = useLocation();
const [threadId, setThreadId] = useState<string | null>(null);
  const [threadData, setThreadData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { messages } = useSocket();

  useEffect(() => {
      const pathParts = location.pathname.split("/");
      const newThreadId = pathParts[2] || null;
      setThreadId(newThreadId);
      console.log("🔄 Updated threadId:", newThreadId);
    }, [location.pathname]);


  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  
  async function fetchThreadStream() {
    const threadUrl = generalFunctions.createUrl("threads");
    setIsLoading(true);
    try {
      const res = await fetch(threadUrl);
      const data = await res.json();
      const sortedData = data.sort(
        (a: ThreadType, b: ThreadType) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setThreadData(sortedData);
      setIsLoading(false);
      return sortedData;
    } catch (err) {
      setIsLoading(false);
      console.error("Failed to fetch threads:", err);
      throw new Error("Failed to fetch threads");
    }
  }

  useEffect(() => {
    fetchThreadStream();
  }, []);

// async function fetchThreadStream({
//   pageParam = undefined,
// }: {
//   pageParam?: string;
// }): Promise<ThreadType[]> {
//   const baseUrl = `threads?limit=10`;
//   const queryUrl = pageParam
//     ? `${baseUrl}&start_after=${encodeURIComponent(pageParam)}`
//     : baseUrl;

//   const threadUrl = generalFunctions.createUrl(queryUrl);

//   try {
//     const res = await fetch(threadUrl);
//     const data = await res.json();

//     const sortedData = data?.sort(
//       (a: ThreadType, b: ThreadType) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//     );

//     return sortedData;
//   } catch (err) {
//     console.error("Failed to fetch threads:", err);
//     throw new Error("Failed to fetch threads");
//   }
// }

//   const { data: allThreads } = useInfiniteQuery({
//     queryKey:["threads"],
//     queryFn: fetchThreadStream,
//     initialPageParam: undefined,
//     // getNextPageParam: (lastPage) => {
//     //   return lastPage;
//     // }
//     getNextPageParam: (lastPage, allPages) => {
//     const lastThread = lastPage?.[lastPage.length - 1];
//     return lastThread?.createdAt ?? undefined; // ISO timestamp from backend
//   },
//   })


const queryEnabled =
  !!threadId &&
  messages?.length >= 7 &&
  !threadData.some((t) => t.threadId === threadId);

const { data: threads } = useQuery({
  queryKey: ['thread-preview', messages?.length],
  queryFn: () => fetchThreadPreview(threadId),
  enabled: queryEnabled,
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  retry: false,
});

useEffect(() => {
  if (!threads) return;

  setThreadData((prev) => {
    const alreadyExists = prev.some((t) => t.threadId === threads.threadId);
    if (alreadyExists) return prev;
    const updated = [threads, ...prev];
    console.log("✅ threadData updated", updated);
    return updated;
  });
}, [threads]);

console.log("threadData", threadData);

  return (
    <AppContext.Provider value={{ threadData, setThreadData, usersData, isLoading }}>
      {children}
    </AppContext.Provider>
  );
}