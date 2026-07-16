import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "components/ui/dialog";
import { Button } from "components/ui/button";
import { Checkbox } from "components/ui/checkbox";
import { ScrollArea } from "components/ui/scroll-area";
import { ButtonSpinner } from "components/Spinner";

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
          <DialogTitle>Download table QR codes</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col space-y-4">
          <label
            htmlFor="select-all"
            className="flex items-center gap-2 text-sm font-medium cursor-pointer"
          >
            <Checkbox
              id="select-all"
              checked={
                tables.length > 0 && selectedTables.length === tables.length
              }
              onCheckedChange={handleSelectAll}
            />
            Select all
          </label>
          <ScrollArea className="h-[300px] border rounded-md p-2">
            {tables.map((table) => (
              <label
                key={table._id}
                htmlFor={`table-${table._id}`}
                className="flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md cursor-pointer hover:bg-muted"
              >
                <Checkbox
                  id={`table-${table._id}`}
                  checked={selectedTables.includes(table._id)}
                  onCheckedChange={() => handleSelectTable(table._id)}
                />
                Table {table.title}
              </label>
            ))}
          </ScrollArea>
          <Button
            onClick={downloadBulkQRCodes}
            disabled={selectedTables.length === 0 || isDownloading}
          >
            {isDownloading ? (
              <ButtonSpinner />
            ) : selectedTables.length > 0 ? (
              `Download ${selectedTables.length} QR code${
                selectedTables.length === 1 ? "" : "s"
              }`
            ) : (
              "Download QR codes"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
