import { generalFunctions } from "@/lib/generalFuntion";
import { ThreadModal } from "@/models/ThreadModel";
import { ThreadTypeDTO } from "@/types/threadType";
import { platform } from "os";

class ThreadServices {
  async fetchAllThreads(): Promise<ThreadTypeDTO[]> {
    try {
      const threadUrl = generalFunctions.createUrl("threads");
      const res = await fetch(threadUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // "x-user-id": generalFunctions.getUserId(),
        },
      });
      const data: ThreadTypeDTO[] = await res.json();
      return data.map((el)=>ThreadModal.fromDTO(el));
      // return data.sort(
      //   (a: ThreadTypeDTO, b: ThreadTypeDTO) =>
      //     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      // ).map((el)=>ThreadModal.fromDTO(el));
    } catch (error) {
      throw new Error("Failed to fetch threads");
    }
  }

  async deleteThreads(threadId: string): Promise<void>{
      try {
      const url = generalFunctions.createUrl(`threads/${threadId}`);
      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": generalFunctions.getUserId(),
        },
      });
      const data = await res.json();
      console.log("data from delete thread", data);
      } catch (error) {
        throw new Error("Failed to delete thread.");
      }
  }

  async fetchMessages(threadId: string) : Promise<Message[]>{
    try {
      const url = generalFunctions.createUrl(`messages/${threadId}`);
        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch (error) {
      throw new Error("Failed to fetch messages");
    }
  }

  async createThread(threadData: {threadId: string, platform: string}): Promise<void> {
    try {
      const url = generalFunctions.createUrl("threads/create");
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: generalFunctions.getUserId(),
          threadId: threadData.threadId,
          platform: threadData.platform
        }),
      });
      const data = await res.json();
      console.log("data from create thread", data);
    } catch (error) {
      throw new Error("Failed to create thread");
    }
  }
}

export const threadServices = new ThreadServices();
