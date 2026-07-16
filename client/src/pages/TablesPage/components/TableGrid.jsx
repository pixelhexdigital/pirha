import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Download, LayoutGrid } from "lucide-react";
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
import { Skeleton } from "components/ui/skeleton";
import { Card } from "components/ui/card";
import Spinner from "components/Spinner";
import EmptyState from "components/EmptyState";
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
  const [deleteTableById] = useDeleteTableByIdMutation();
  const [updateTableById] = useUpdateTableByIdMutation();
  const [getTableDetailsById] = useGetTableDetailsByIdMutation();
  const [downloadQr, { isLoading: isDownloading }] = useDownloadQrMutation();

  const tableSummaryData = {
    totalTables: tableData?.data?.totalTables || 0,
    availableTables: tableData?.data?.freeTables || 0,
    occupiedTables: tableData?.data?.occupiedTables || 0,
  };

  const hasNextPage = tableData?.data?.hasNextPage || false;
  const isFiltered = Boolean(
    debouncedQuery || filter.status || filter.minCapacity
  );

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
      <div className="flex justify-end mb-3">
        <Button variant="outline" onClick={handleBulkQRGenerate}>
          <Download className="w-4 h-4 mr-2" /> Download bulk QR codes
        </Button>
      </div>
      {isLoading && !tables.length ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="w-20 h-5" />
                <Skeleton className="w-16 h-5 rounded-full" />
              </div>
              <Skeleton className="w-24 h-4" />
              <div className="flex gap-2 pt-2">
                <Skeleton className="flex-1 h-8 rounded-md" />
                <Skeleton className="w-8 h-8 rounded-md" />
              </div>
            </Card>
          ))}
        </div>
      ) : tables.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title={isFiltered ? "No tables match your filters" : "No tables yet"}
          description={
            isFiltered
              ? "Try adjusting or clearing your filters above."
              : "Add your first table to start taking QR orders."
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
      )}
      {isFetching && tables.length > 0 && <Spinner size="lg" className="mt-4" />}

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
