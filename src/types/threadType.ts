export type ThreadTypeDTO = {
    threadId: string;
    userId: string;
    createdAt: string;
    title: string;
    num_of_msgs: number;
    title_category_01: string;
    title_category_02: string;
    status_indicator: string;
    platform: "terra" | "ai_games";
}