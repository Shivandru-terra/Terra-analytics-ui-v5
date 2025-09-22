// import { generalFunctions } from "@/lib/generalFuntion";
// import { createContext, useEffect, useState } from "react";
// import { useSocket } from "./SocketContext";
// import { useLocation } from "react-router-dom";
// import { useInfiniteQuery, useQuery, QueryFunctionContext  } from '@tanstack/react-query';
// import { fetchUsers, fetchThreadPreview } from "@/api/fetch";

// export const AppContext = createContext(undefined);


// export default function AppContextProvider({ children }) {
// const location = useLocation();
// const [threadId, setThreadId] = useState<string | null>(null);
//   // const [threadData, setThreadData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const { messages } = useSocket();

//   useEffect(() => {
//       const pathParts = location.pathname.split("/");
//       const newThreadId = pathParts[2] || null;
//       setThreadId(newThreadId);
//       console.log("🔄 Updated threadId:", newThreadId);
//     }, [location.pathname]);


//   // const { data: usersData } = useQuery({
//   //   queryKey: ['users'],
//   //   queryFn: fetchUsers,
//   // });
  
//   // async function fetchThreadStream() {
//   //   const threadUrl = generalFunctions.createUrl("threads");
//   //   setIsLoading(true);
//   //   try {
//   //     const res = await fetch(threadUrl);
//   //     const data = await res.json();
//   //     const sortedData = data.sort(
//   //       (a: ThreadType, b: ThreadType) =>
//   //         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//   //     );
//   //     setThreadData(sortedData);
//   //     setIsLoading(false);
//   //     return sortedData;
//   //   } catch (err) {
//   //     setIsLoading(false);
//   //     console.error("Failed to fetch threads:", err);
//   //     throw new Error("Failed to fetch threads");
//   //   }
//   // }

//   // useEffect(() => {
//   //   fetchThreadStream();
//   // }, []);



// // const queryEnabled =
// //   !!threadId &&
// //   messages?.length >= 7 &&
// //   !threadData.some((t) => t.threadId === threadId);

// // const { data: threads } = useQuery({
// //   queryKey: ['thread-preview', messages?.length],
// //   queryFn: () => fetchThreadPreview(threadId),
// //   enabled: queryEnabled,
// //   refetchOnMount: false,
// //   refetchOnWindowFocus: false,
// //   retry: false,
// // });

// // useEffect(() => {
// //   if (!threads) return;

// //   setThreadData((prev) => {
// //     const alreadyExists = prev.some((t) => t.threadId === threads.threadId);
// //     if (alreadyExists) return prev;
// //     const updated = [threads, ...prev];
// //     console.log("✅ threadData updated", updated);
// //     return updated;
// //   });
// // }, [threads]);

// // console.log("threadData", threadData);

//   return (
//     <AppContext.Provider value={{ , isLoading }}>
//       {children}
//     </AppContext.Provider>
//   );
// }