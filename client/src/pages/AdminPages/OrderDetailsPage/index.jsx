import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Circle, MoreHorizontal } from "lucide-react";

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

// CONSTANTS FOR STATUS COLORS AND TEXT
const STATUS_COLORS = {
  new: "#f6ad55",
  inProgress: "#4e60ff",
  completed: "#1abf70",
  cancelled: "#ff5c60",
};

const STATUS_TEXT = {
  new: "New Order",
  inProgress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const data = [
  {
    id: "1",
    itemName: "Chicken Biryani",
    quantity: "2",
    amount: "100.00",
    request: "No Spicy",
    imageSrc: "https://picsum.photos/200/?random=9",
    status: "new",
    orderTime: "12:00 PM",
  },
  {
    id: "2",
    itemName: "Mutton Biryani",
    quantity: "1",
    amount: "200.00",
    request: "Extra Spicy",
    imageSrc: "https://picsum.photos/200/?random=6",
    status: "new",
    orderTime: "12:00 PM",
  },

  {
    id: "3",
    itemName: "Veg Biryani",
    quantity: "3",
    amount: "150.00",
    request: "No Spicy",
    imageSrc: "https://picsum.photos/200/?random=3",
    status: "cancelled",
    orderTime: "11:30 PM",
  },
  {
    id: "4",
    itemName: "Paneer Biryani",
    quantity: "1",
    amount: "120.00",
    request: "Extra Spicy",
    imageSrc: "https://picsum.photos/200/?random=1",
    status: "inProgress",
    orderTime: "11:30 PM",
  },
  {
    id: "5",
    itemName: "Egg Biryani",
    quantity: "2",
    amount: "160.00",
    request: "No Spicy",
    imageSrc: "https://picsum.photos/200/?random=2",
    status: "completed",
    orderTime: "11:00 PM",
  },
];

export const columns = [
  {
    accessorKey: "id",
    header: "Item",
    cell: ({ row }) => {
      const { itemName, imageSrc, request } = row.original;

      return (
        <div className="flex items-start gap-4">
          <img src={imageSrc} alt={itemName} className="w-12 h-12 rounded-md" />
          <div>
            <div className="text-sm font-semibold">{itemName}</div>
            <div className="text-xs text-muted-foreground">
              {request ? `(${request})` : "No special request"}
            </div>
          </div>
        </div>
      );
    },
  },

  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const quantity = row.getValue("quantity");

      return <div className="w-full">{quantity}x</div>;
    },
  },

  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));

      // Format the amount as a dollar amount
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "INR",
      }).format(amount);

      return <div className="w-full">{formatted}</div>;
    },
  },
  {
    accessorKey: "orderTime",
    header: "Order Time",
    cell: ({ row }) => <div>{row.getValue("orderTime")}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status");

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
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="space-y-4 w-[98%] mx-auto">
      <h2 className="h4">Orders</h2>
      <div className="w-full p-4 space-y-4 bg-white rounded-md shadow-md ring-1 ring-black/5">
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
                <TableCell colSpan={columns.length} className="h-24 tex">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
