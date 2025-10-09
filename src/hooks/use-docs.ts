import { docServices } from "@/services/DocServices";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export function useGetAllDocs(isOpen: boolean){
    return useQuery({
        queryKey: ["docs"],
        queryFn: () => docServices.getAllDocs(),
        enabled: !!isOpen
    })
}

export function useGetDocData(doc_id: string) {
    const shouldFetch = doc_id === "Brand" || doc_id === "Brand_2" || doc_id === "User_Journey" || doc_id === "User_Journey_2";
    return useQuery({
        queryKey: ["doc-data", doc_id],
        queryFn: () => docServices.getDocData(doc_id),
        enabled: !!shouldFetch
    })
}

export function useUpdateDocData(doc_id: string){
    const queryClient = useQueryClient();
    return useMutation({
        mutationKey: ["update-doc-data", doc_id],
        mutationFn: (content: string) => docServices.updateDocData(doc_id, content),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doc-data", doc_id] }),
    })
}