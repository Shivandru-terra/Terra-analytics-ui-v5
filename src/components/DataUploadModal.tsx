import { useAddCsvDataToFirestore } from "@/hooks/use-csv";
import {
  useGetAllDocs,
  useGetDocData,
  useUpdateDocData,
} from "@/hooks/use-docs";
import { useGetAllWorkSheets } from "@/hooks/use-workbook";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent } from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useSocket } from "@/context/SocketContext";

const DataUploadModal = ({ isOpen, onClose }) => {
  const [option, setOption] = useState<string>("");
  const [workSheet, setWorkSheet] = useState("");
  const { data: docsList } = useGetAllDocs(isOpen);
  const { platform } = useSocket();
  const { data: workSheets } = useGetAllWorkSheets(isOpen, platform);
  const { data: docData } = useGetDocData(option);
  const [content, setContent] = useState("");
  const { mutate: updateDoc } = useUpdateDocData(option);
  const { mutate: addCsvData, isPending } = useAddCsvDataToFirestore(platform)
  const [filteredDocs, setFilteredDocs] = useState<string[]>([]);

  // workBookData is the raw array from your backend

  useEffect(() => {
    if (docData) {
      setContent(docData.content);
    }
  }, [docData]);

  useEffect(() => {
  if (!docsList) return;

  const filtered = platform === "terra"
    ? docsList.filter((doc) => !doc.includes("_2"))
    : docsList.filter((doc) => doc.includes("_2"));

  setFilteredDocs(filtered);
}, [platform, docsList]);

  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setOption("");
      setWorkSheet("");
    }
  }, [isOpen]);

  const handleUpload = () => {
    addCsvData({ doc_id: option, sheetName: workSheet })
  };

  function handleUpdate() {
    updateDoc(content);
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[50vw] max-h-[80vh] px-4 py-6 flex flex-col gap-8">
        {/* Selects / options */}
        {docData && (
          <div className="p-4">
            <Textarea
              value={content || ""}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[20vh]"
            />
            <Button variant="outline" className="mt-4" onClick={handleUpdate}>
              Update
            </Button>
          </div>
        )}
        <div className="flex flex-col gap-4 w-full md:w-3/4 mx-auto">
          <Select value={option} onValueChange={setOption}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- Select Firestore Schema --" />
            </SelectTrigger>
            <SelectContent>
              {filteredDocs?.map((el: string) => (
                <SelectItem key={el} value={el}>
                  {el}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={workSheet} onValueChange={setWorkSheet}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- Select WorkSheet --" />
            </SelectTrigger>
            <SelectContent>
              {workSheets?.map((el: string) => (
                <SelectItem key={el} value={el}>
                  {el}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleUpload}
            disabled={!workSheet || !option}
            className="cursor-pointer"
          >
            {isPending ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DataUploadModal;
