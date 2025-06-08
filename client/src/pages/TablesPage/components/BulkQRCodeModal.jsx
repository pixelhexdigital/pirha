import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Checkbox } from "components/ui/checkbox";
import { ScrollArea } from "components/ui/scroll-area";

export function BulkQRCodeModal({
  isOpen,
  onClose,
  tables,
  OnDownloadQRCode,
  isDownloading,
}) {
  const [selectedTables, setSelectedTables] = useState([]);

  const handleSelectAll = () => {
    if (selectedTables.length === tables.length) {
      setSelectedTables([]);
    } else {
      setSelectedTables(tables.map((table) => table._id));
    }
  };

  const handleSelectTable = (tableId) => {
    if (selectedTables.includes(tableId)) {
      setSelectedTables(selectedTables.filter((id) => id !== tableId));
    } else {
      setSelectedTables([...selectedTables, tableId]);
    }
  };

  const downloadBulkQRCodes = async () => OnDownloadQRCode({ selectedTables });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Bulk QR Codes</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedTables.length === tables.length}
              onCheckedChange={handleSelectAll}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Select All
            </label>
          </div>
          <ScrollArea className="h-[300px] border rounded-md p-4">
            {tables.map((table) => (
              <div key={table._id} className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id={`table-${table._id}`}
                  checked={selectedTables.includes(table._id)}
                  onCheckedChange={() => handleSelectTable(table._id)}
                />
                <label
                  htmlFor={`table-${table._id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Table {table.title}
                </label>
                <QRCodeSVG
                  id={`qr-code-${table._id}`}
                  value={`https://your-restaurant-url.com/table/${table._id}`}
                  size={64}
                  level="M"
                  className="hidden"
                />
              </div>
            ))}
          </ScrollArea>
          <Button
            onClick={downloadBulkQRCodes}
            disabled={selectedTables.length === 0}
          >
            {isDownloading ? (
              <div className="ring-loader" />
            ) : (
              "Download Selected QR Codes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
