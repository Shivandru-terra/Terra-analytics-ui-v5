import { ThreadTypeDTO } from "@/types/threadType";

export class ThreadModal implements ThreadTypeDTO {
  constructor(
    public readonly threadId: string,
    public readonly userId: string,
    public readonly createdAt: string,
    public readonly title: string,
    public readonly num_of_msgs: number,
    public readonly title_category_01: string,
    public readonly title_category_02: string,
    public readonly status_indicator: string
  ) {}

  formatTime() {
    const date = new Date(this.createdAt);
    return date.toLocaleString("en-US", {
      day: "numeric",
      month: "long",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  static fromDTO(thread: ThreadTypeDTO) {
    return new ThreadModal(
      thread.threadId,
      thread.userId,
      thread.createdAt,
      thread.title,
      thread.num_of_msgs,
      thread.title_category_01,
      thread.title_category_02,
      thread.status_indicator
    );
  }

  toDTO(): ThreadTypeDTO {
    return {
      threadId: this.threadId,
      userId: this.userId,
      createdAt: this.createdAt,
      title: this.title,
      num_of_msgs: this.num_of_msgs,
      title_category_01: this.title_category_01,
      title_category_02: this.title_category_02,
      status_indicator: this.status_indicator,
    };
  }
}


