import { workBookServices } from "@/services/WorkBookServices";
import { useQuery } from "@tanstack/react-query";

export function useGetAllWorkSheets(isOpen: boolean) {
    return useQuery({
        queryKey: ["workbooks"],
        queryFn: () => workBookServices.getAllWorkSheets(),
        enabled: !!isOpen
    });
}

export function useGetSheetData(sheet_name: string){
    return useQuery({
        queryKey: ["sheet-data", sheet_name],
        queryFn: () => workBookServices.getSheetData(sheet_name),
        enabled: !!sheet_name
    })
}