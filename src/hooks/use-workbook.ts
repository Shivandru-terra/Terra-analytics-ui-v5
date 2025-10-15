import { workBookServices } from "@/services/WorkBookServices";
import { useQuery } from "@tanstack/react-query";

export function useGetAllWorkSheets(isOpen: boolean, platform: string) {
    return useQuery({
        queryKey: ["workbooks", platform],
        queryFn: () => workBookServices.getAllWorkSheets(platform),
        enabled: !!isOpen && !!platform, 
    });
}

export function useGetSheetData(sheet_name: string, platform: string){
    return useQuery({
        queryKey: ["sheet-data", sheet_name, platform],
        queryFn: () => workBookServices.getSheetData(sheet_name, platform),
        enabled: !!sheet_name && !!platform
    })
}