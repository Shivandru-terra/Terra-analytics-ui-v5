import { csvServices } from "@/services/csvServices";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddCsvDataToFirestore() {
//   const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add-csv-data-to-firestore"],
    mutationFn: (data: { doc_id: string; sheetName: string }) =>
      csvServices.addDataFromCsvToFireStore(data.doc_id, data.sheetName),
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ["docs"] }),
  });
}
