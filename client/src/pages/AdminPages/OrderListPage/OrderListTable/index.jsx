import moment from "moment";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Circle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import { useState } from "react";

const STATUS_COLORS = {
  new: "#f6ad55",
  inProgress: "#4e60ff",
  ready: "#1abf70",
  completed: "#1abf70",
  billed: "#1abf70",
  cancelled: "#ff5c60",
};

const STATUS_TEXT = {
  new: "New Order",
  inProgress: "In Progress",
  completed: "Completed",
  ready: "Ready",
  billed: "Billed",
  cancelled: "Cancelled",
};

const columns = [
  {
    accessorKey: "_id",
    cell: ({ row }) => (
      <div
        style={{
          // Since rows are flattened by default,
          // we can use the row.depth property
          // and paddingLeft to visually indicate the depth
          // of the row
          paddingLeft: `${row.depth * 2}rem`,
        }}
      >
        {console.log("row", row)}
        <div>
          {row.getCanExpand() ? (
            <button
              {...{
                onClick: row.getToggleExpandedHandler(),
                style: { cursor: "pointer" },
              }}
            >
              {row.getIsExpanded() ? "👇" : "👉"}
            </button>
          ) : (
            "🔵"
          )}{" "}
          {row.getValue("_id")}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "table",
    header: "Table No",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("table")}</div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt");
      const formattedDate = moment(date).format("DD MMM YYYY");

      return <div>{formattedDate}</div>;
    },
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      const time = row.getValue("updatedAt");
      const formattedTime = moment(time).format("hh:mm A");

      return <div>{formattedTime}</div>;
    },
  },
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("totalAmount");

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
      }).format(amount);

      return <div className="w-full">{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      let status = row.getValue("status");

      status = typeof status === "string" ? status.toLowerCase() : status;

      return (
        <div className="flex items-center gap-2">
          <Circle
            size={8}
            fill={STATUS_COLORS[status]}
            color={STATUS_COLORS[status]}
          />
          {STATUS_TEXT[status]}
        </div>
      );
    },
  },
];

const OrderListTable = ({ data }) => {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [expanded, setExpanded] = useState({});

  console.log("data", data);

  const tableData = Array.isArray(data) ? data : [];

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.items,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      expanded,
      sorting,
      columnFilters,
    },
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-3 border-b-[1px]">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={columns?.length}
              className="h-24 text-lg text-center"
            >
              No results
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default OrderListTable;
