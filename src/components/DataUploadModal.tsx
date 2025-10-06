import React, { useState, useRef } from "react";
import { Dialog, DialogContent } from "./ui/dialog";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { generalFunctions } from "@/lib/generalFuntion";

const DataUploadModal = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [option, setOption] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
        setMessage("❌ Only CSV files are allowed.");
        setFile(null);
        if (fileRef.current) fileRef.current.value = ""; // reset input
        return;
      }
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("doc_id", option);

    setUploading(true);
    setMessage(null);

    try {
      const url = generalFunctions.createUrl("addData");

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const result = await res.json();
      setMessage(`✅ Uploaded: ${result.filename || file.name}`);
      setFile(null);
      setOption("");
    } catch (err) {
      setMessage("❌ Error uploading file.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[40vw] max-h-[50vh] px-4 py-12 flex flex-col gap-8 justify-center items-center">
        <div className="w-[70%] flex items-center justify-center">
          <Select value={option} onValueChange={setOption}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="-- Select Option --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Brand">Brand</SelectItem>
              <SelectItem value="Brand_2">Brand_2</SelectItem>
              <SelectItem value="Game_List">Game_List</SelectItem>
              <SelectItem value="Game_List_2">Game_List_2</SelectItem>
              <SelectItem value="Game_Values">Game_Values</SelectItem>
              <SelectItem value="Merged_schema">Merged_schema</SelectItem>
              <SelectItem value="Merged_schema_2">Merged_schema_2</SelectItem>
              <SelectItem value="User_Journey">User_Journey</SelectItem>
              <SelectItem value="User_Journey_2">User_Journey_2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {option && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-3 rounded-md shadow-sm w-[90%]">
            <p className="text-sm font-medium">
              ⚠️ Make sure the file follows the correct schema as per{" "}
              <span className="font-semibold">{option}</span> collection
            </p>
          </div>
        )}
        <div className="w-full h-auto flex items-center justify-center gap-4">
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {file ? `📄 ${file.name}` : "Choose CSV File"}
          </Button>

          {/* Upload button */}
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="cursor-pointer"
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </Button>
        </div>
          {message && <p className="text-sm">{message}</p>}
      </DialogContent>
    </Dialog>
  );
};

export default DataUploadModal;
