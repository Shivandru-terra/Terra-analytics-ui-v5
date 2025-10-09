import Spreadsheet from "react-spreadsheet";

const SheetPreviewDialog = ({ sheetData, onClose }) => {
  // Transform your API data into react-spreadsheet format
  // Each cell: { value: "cell content" }
  const data = sheetData.map(row => row.map(cell => ({ value: cell || "" })));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
        <h2 className="text-lg font-bold mb-4">Sheet Preview</h2>

        <Spreadsheet data={data} />

        <div className="mt-4 text-right">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SheetPreviewDialog;
