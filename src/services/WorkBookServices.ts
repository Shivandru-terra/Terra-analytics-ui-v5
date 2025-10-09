import { generalFunctions } from "@/lib/generalFuntion";

class WorkBookServices {
    async getAllWorkSheets(){
        try {
            const url = generalFunctions.createUrl("workbooks/");
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch docs");
        }
    }

    async getSheetData(sheet_name: string){
        try {
            const url = generalFunctions.createUrl(`workbooks/data/${sheet_name}`);
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch docs");
        }
    }
}

export const workBookServices = new WorkBookServices();