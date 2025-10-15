import { generalFunctions } from "@/lib/generalFuntion";

class WorkBookServices {
    async getAllWorkSheets(platform: string){
        try {
            const url = generalFunctions.createUrl(`workbooks/${platform}`);
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch docs");
        }
    }

    async getSheetData(sheet_name: string, platform: string){
        try {
            const url = generalFunctions.createUrl(`workbooks/data/${platform}/${sheet_name}`);
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch docs");
        }
    }
}

export const workBookServices = new WorkBookServices();