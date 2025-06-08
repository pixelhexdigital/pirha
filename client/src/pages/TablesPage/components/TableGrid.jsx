import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Download } from "lucide-react";
import {
  useDeleteTableByIdMutation,
  useDownloadQrMutation,
  useGetMyTablesQuery,
  useGetTableDetailsByIdMutation,
  useUpdateTableByIdMutation,
} from "api/tableApi";
import { useDebounce } from "hooks/useDebounce";

import { TableCard } from "./TableCard";
import { BulkQRCodeModal } from "./BulkQRCodeModal";
import { TableDetailsModal } from "./TableDetailsModal";
import { Button } from "components/ui/button";
import { errorToast, successToast } from "lib/helper";
import { TableSummary } from "pages/TablesPage/components/TableSummary";
import { TableFilters } from "pages/TablesPage/components/TableFilters";

const PAGINATION_LIMIT = 20;
const DEBOUNCE_TIME = 500;

export function TableGrid() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isBulkQRModalOpen, setIsBulkQRModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    status: "",
    minCapacity: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  const { ref, inView } = useInView({ threshold: 1 });
  const debouncedQuery = useDebounce(searchQuery, DEBOUNCE_TIME);

  const {
    data: tableData,
    isLoading,
    isFetching,
  } = useGetMyTablesQuery({
    page: currentPage,
    limit: PAGINATION_LIMIT,
    search: debouncedQuery,
    ...filter,
  });
  const [deleteTableById, { isLoading: isDeleting }] =
    useDeleteTableByIdMutation();
  const [updateTableById, { isLoading: isUpdating }] =
    useUpdateTableByIdMutation();
  const [getTableDetailsById, { isLoading: isGettingDetails }] =
    useGetTableDetailsByIdMutation();
  const [downloadQr, { isLoading: isDownloading }] = useDownloadQrMutation();

  // console.log("tableData", tableData);

  const tableSummaryData = {
    totalTables: tableData?.data?.totalTables || 0,
    availableTables: tableData?.data?.freeTables || 0,
    occupiedTables: tableData?.data?.occupiedTables || 0,
  };

  const hasNextPage = tableData?.data?.hasNextPage || false;

  useEffect(() => {
    if (tableData?.data?.tables) {
      setTables(tableData.data.tables);
    }
  }, [tableData]);

  useEffect(() => {
    // Only fetch if inView, not fetching, and hasNextPage is true
    if (inView && !isLoading && hasNextPage && !isFetching) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [inView, isLoading, hasNextPage, isFetching]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  useEffect(() => {
    if (!debouncedQuery) return;
    if (currentPage > 1) setCurrentPage(1);
  }, [debouncedQuery, currentPage]);

  const handleTableUpdate = (updatedTable) => {
    setTables(
      tables.map((table) =>
        table._id === updatedTable._id ? updatedTable : table
      )
    );
    setSelectedTable(updatedTable);
  };

  const handleQuickAction = async (tableId, newStatus) => {
    try {
      await updateTableById({
        tableId,
        status: newStatus,
      }).unwrap();
    } catch (error) {
      errorToast({ error, message: "Failed to update table status" });
    }
  };

  const handleBulkQRGenerate = () => {
    setIsBulkQRModalOpen(true);
  };

  const handleDelete = async (tableId) => {
    try {
      await deleteTableById(tableId).unwrap();
    } catch (error) {
      errorToast({ error, message: "Failed to delete table" });
    }
  };

  const handleDetailsClick = async (tableId) => {
    try {
      const { data } = await getTableDetailsById(tableId).unwrap();
      setSelectedTable(data);
      setIsDetailsModalOpen(true);
    } catch (error) {
      errorToast({ error, message: "Failed to get table details" });
    }
  };

  const handleDownloadQr = async ({ selectedTables }) => {
    const payload = {
      tableIds: selectedTables,
    };

    try {
      const blob = await downloadQr(payload).unwrap();
      if (!(blob instanceof Blob)) {
        throw new Error("Invalid file response"); // Check if response is a Blob
      }

      // Create a URL for the file
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor tag and trigger download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "qr_codes.zip");
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      successToast({
        message: "QR codes downloaded successfully!",
      });
      setIsBulkQRModalOpen(false);
    } catch (error) {
      errorToast({
        error,
        message: "Failed to download QR codes.",
      });
    }
  };

  return (
    <div>
      <TableSummary data={tableSummaryData} />
      <TableFilters
        filter={filter}
        setFilter={setFilter}
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <div className="flex sm:items-center justify-between p-4  sm:flex-row flex-col gap-4">
        <h2 className="text-2xl font-bold">Tables</h2>
        <Button onClick={handleBulkQRGenerate}>
          <Download className="mr-2 h-4 w-4" /> Download Bulk QR Codes
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2.5">
        {tables.map((table) => (
          <TableCard
            key={table._id}
            table={table}
            onClick={() => handleDetailsClick(table._id)}
            onQuickAction={handleQuickAction}
            onDelete={handleDelete}
            onQrCodeDownload={handleDownloadQr}
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

      <BulkQRCodeModal
        tables={tables}
        isDownloading={isDownloading}
        isOpen={isBulkQRModalOpen}
        OnDownloadQRCode={handleDownloadQr}
        onClose={() => setIsBulkQRModalOpen(false)}
      />
    </div>
  );
}
