import { useState } from "react";
import { TableCard } from "./TableCard";
import { TableDetailsModal } from "./TableDetailsModal";

// This would typically come from an API call
const initialTablesData = {
  statusCode: 200,
  data: {
    tables: [
      {
        _id: "667ceeefdda8032e506d08a1",
        title: "a-3",
        baseUrl: "https://www.pirha.onrender.com/home",
        restaurantId: "667a82e32fa639ab387f786e",
        status: "Free",
        capacity: 4,
        createdAt: "2024-06-27T04:47:43.362Z",
        updatedAt: "2024-06-27T04:47:43.362Z",
        __v: 0,
      },
      {
        _id: "667ceeefdda8032e506d089f",
        title: "a-1",
        baseUrl: "https://www.pirha.onrender.com/home",
        restaurantId: "667a82e32fa639ab387f786e",
        status: "Occupied",
        capacity: 2,
        createdAt: "2024-06-27T04:47:43.358Z",
        updatedAt: "2024-06-27T04:47:43.358Z",
        __v: 0,
      },
      {
        _id: "667ceeefdda8032e506d08a0",
        title: "a-2",
        baseUrl: "https://www.pirha.onrender.com/home",
        restaurantId: "667a82e32fa639ab387f786e",
        status: "Reserved",
        capacity: 6,
        createdAt: "2024-06-27T04:47:43.360Z",
        updatedAt: "2024-06-27T04:47:43.360Z",
        __v: 0,
      },
      {
        _id: "667ceeefdda8032e506d08a2",
        title: "a-4",
        baseUrl: "https://www.pirha.onrender.com/home",
        restaurantId: "667a82e32fa639ab387f786e",
        status: "Free",
        capacity: 4,
        createdAt: "2024-06-27T04:47:43.362Z",
        updatedAt: "2024-06-27T04:47:43.362Z",
        __v: 0,
      },
    ],
    totalTables: 4,
    limit: 10,
    page: 1,
    totalPages: 1,
    pagingCounter: 1,
    hasPrevPage: false,
    hasNextPage: false,
    prevPage: null,
    nextPage: null,
  },
  message: "Tables retrieved successfully",
  success: true,
};

export function TableGrid() {
  const [tables, setTables] = useState(initialTablesData.data.tables);
  const [selectedTable, setSelectedTable] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTableClick = (table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleTableUpdate = (updatedTable) => {
    setTables(
      tables.map((table) =>
        table._id === updatedTable._id ? updatedTable : table
      )
    );
    setSelectedTable(updatedTable);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {tables.map((table) => (
          <TableCard
            key={table._id}
            table={table}
            onClick={() => handleTableClick(table)}
          />
        ))}
      </div>
      <TableDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        table={selectedTable}
        onTableUpdate={handleTableUpdate}
      />
    </div>
  );
}
