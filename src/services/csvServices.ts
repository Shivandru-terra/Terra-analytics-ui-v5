import { generalFunctions } from "@/lib/generalFuntion";

class CsvServices {
    async addDataFromCsvToFireStore(doc_id: string, sheetName: string, platform: string): Promise<void> {
        try {
            const url = generalFunctions.createUrl(`csv/addData/${platform}`);
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ doc_id, sheetName })
            });
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch docs");
        }
    }
}

export const csvServices = new CsvServices();