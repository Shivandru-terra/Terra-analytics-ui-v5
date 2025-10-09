import { generalFunctions } from "@/lib/generalFuntion";

class DocServices {
    async getAllDocs(): Promise<string[]>{
        try {
            const url = generalFunctions.createUrl("llm_docs/");
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch docs");
        }
    }

    async getDocData(doc_id: string): Promise<{ content: string }>{
        try {
            const url = generalFunctions.createUrl(`llm_docs/data/${doc_id}`);
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (error) {
            throw new Error("Failed to fetch doc");
        }
    }

    async updateDocData(doc_id: string, content: string): Promise<void>{
        try {
            const url = generalFunctions.createUrl(`llm_docs/update/${doc_id}`);
            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
            });
            const data = await res.json();
            console.log("data from update doc", data);
        } catch (error) {
            throw new Error("Failed to update doc");
        }
    }
}

export const docServices = new DocServices();