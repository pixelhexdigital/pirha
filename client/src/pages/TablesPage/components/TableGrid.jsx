import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Download } from "lucide-react";
import { useGetMyTablesQuery } from "api/tableApi";

import { Button } from "components/ui/button";
import { TableCard } from "./TableCard";
import { QRCodeModal } from "./QRCodeModal";
import { TableDetailsModal } from "./TableDetailsModal";
import { BulkQRCodeModal } from "./BulkQRCodeModal";

const PAGINATION_LIMIT = 20;

export function TableGrid() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState(null);
  const [isBulkQRModalOpen, setIsBulkQRModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { ref, inView } = useInView({ threshold: 1 });

  const { data: tableData, isLoading } = useGetMyTablesQuery({
    page: currentPage,
    limit: PAGINATION_LIMIT,
  });

  // console.log("tableData", tableData);

  const hasNextPage = tableData?.data?.hasNextPage || false;

  useEffect(() => {
    if (tableData?.data?.tables) {
      setTables(tableData.data.tables);
    }
  }, [tableData]);

  useEffect(() => {
    // Only fetch if inView, not fetching, and hasNextPage is true
    if (inView && !isLoading && hasNextPage) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [inView, isLoading, hasNextPage]);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setIsDetailsModalOpen(true);
  };

  const handleTableUpdate = (updatedTable) => {
    setTables(
      tables.map((table) =>
        table._id === updatedTable._id ? updatedTable : table
      )
    );
    setSelectedTable(updatedTable);
  };

  const handleQuickAction = (tableId, newStatus) => {
    setTables(
      tables.map((table) =>
        table._id === tableId ? { ...table, status: newStatus } : table
      )
    );
  };

  const handleGenerateQR = (tableId) => {
    setSelectedTableForQR(tableId);
    setIsQRModalOpen(true);
  };

  const handleBulkQRGenerate = () => {
    setIsBulkQRModalOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tables</h2>
        <Button onClick={handleBulkQRGenerate}>
          <Download className="mr-2 h-4 w-4" /> Download Bulk QR Codes
        </Button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <TableCard
            key={table._id}
            table={table}
            onClick={() => handleTableClick(table)}
            onQuickAction={handleQuickAction}
            onGenerateQR={handleGenerateQR}
          />
        ))}
      </div>
      {isLoading && (
        <div className="flex justify-center items-center mt-4">
          <div className="ring-loader border-secondary size-10" />
        </div>
      )}

      {/* This div acts as a trigger for infinite scroll */}
      {hasNextPage && <div ref={ref} className="h-10"></div>}
      <TableDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        table={selectedTable}
        onTableUpdate={handleTableUpdate}
      />
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        tableId={selectedTableForQR || ""}
      />
      <BulkQRCodeModal
        isOpen={isBulkQRModalOpen}
        onClose={() => setIsBulkQRModalOpen(false)}
        tables={tables}
      />
    </div>
  );
}
