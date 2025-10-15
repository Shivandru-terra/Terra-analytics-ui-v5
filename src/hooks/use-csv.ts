import { platform } from 'os';
import { csvServices } from "@/services/csvServices";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddCsvDataToFirestore(platform: string) {
//   const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["add-csv-data-to-firestore", platform],
    mutationFn: (data: { doc_id: string; sheetName: string }) =>
      csvServices.addDataFromCsvToFireStore(data.doc_id, data.sheetName, platform),
    // onSuccess: () => queryClient.invalidateQueries({ queryKey: ["docs"] }),
  });
}
