import moment from "moment";
import { useState } from "react";
import { useSelector } from "react-redux";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ChevronRight, Minus, MoreHorizontal } from "lucide-react";

import StatusBadge from "components/StatusBadge";
import { Button } from "components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import Layout from "components/Layout";
import PageHeader from "components/PageHeader";
import { useGetOrdersDataQuery } from "api/adminApi";
import { selectOrders } from "store/OrderSlice";
import { numberToCurrency } from "lib/helper";

const columns = [
  {
    accessorKey: "_id",
    cell: ({ row }) => (
      <div
        style={{
          paddingLeft: `${row.depth * 2}rem`,
        }}
      >
        <div className="flex items-center gap-1">
          {row.getCanExpand() ? (
            <button
              onClick={row.getToggleExpandedHandler()}
              className="p-0.5 rounded hover:bg-muted transition-colors"
              aria-expanded={row.getIsExpanded()}
              aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
            >
              {row.getIsExpanded() ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </button>
          ) : (
            <Minus className="size-4 text-muted-foreground" />
          )}{" "}
          {row.getValue("_id")}
        </div>
      </div>
    ),
  },

  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      // const quantity = row.getValue("quantity");
      const quantity =
        row.getValue("quantity") ||
        row.original?.items?.reduce((acc, item) => acc + item.quantity, 0);

      return <div className="w-full">{quantity}x</div>;
    },
  },

  {
    accessorKey: "price",
    header: "Amount",
    cell: ({ row }) => (
      <div className="w-full">
        {numberToCurrency(
          parseFloat(row.original?.totalAmount || row.getValue("price")),
          "INR",
          2
        )}
      </div>
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Order Time",
    cell: ({ row }) => {
      const time = row.getValue("updatedAt");
      const formattedTime = moment(time).format("hh:mm A");

      return <div>{formattedTime}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: () => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button aria-haspopup="true" size="icon" variant="ghost">
              <MoreHorizontal className="w-4 h-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Button variant="ghost" size="sm">
                Start Preparing
              </Button>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Button variant="ghost" size="sm">
                Mark as Completed
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

const OrderDetailsPage = () => {
  const ordersData = useSelector(selectOrders);

  const [pageNo] = useState(1);
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [expanded, setExpanded] = useState({});

  useGetOrdersDataQuery(
    { pageNo, status: "New" },
    { refetchOnMountOrArgChange: true }
  );
  const { orders } = ordersData || {};

  const tableData = orders ? orders : [];
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
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
    },
  });

  return (
    <Layout>
      <PageHeader title="Orders" />
      <div className="space-y-4 w-[98%] mx-auto">
        <div className="w-full p-4 space-y-4 bg-card rounded-md shadow-md ring-1 ring-border">
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
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailsPage;
