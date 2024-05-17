// import { Circle, MoreHorizontal } from "lucide-react";

// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuTrigger,
// } from "components/ui/dropdown-menu";

// import { Button } from "components/ui/button";

// // CONSTANTS FOR STATUS COLORS AND TEXT
// const STATUS_COLORS = {
//   new: "#f6ad55",
//   inProgress: "#4e60ff",
//   completed: "#1abf70",
//   cancelled: "#ff5c60",
// };

// const STATUS_TEXT = {
//   new: "New Order",
//   inProgress: "In Progress",
//   completed: "Completed",
//   cancelled: "Cancelled",
// };

// export const orderDetailsColumns = [
//   {
//     accessorKey: "id",
//     header: "Item",
//     cell: ({ row }) => {
//       const { itemName, imageSrc, request } = row.original;

//       return (
//         <div className="flex items-start gap-4">
//           <img src={imageSrc} alt={itemName} className="w-12 h-12 rounded-md" />
//           <div>
//             <div className="text-sm font-semibold">{itemName}</div>
//             <div className="text-xs text-muted-foreground">
//               {request ? `(${request})` : "No special request"}
//             </div>
//           </div>
//         </div>
//       );
//     },
//   },

//   {
//     accessorKey: "quantity",
//     header: "Quantity",
//     cell: ({ row }) => {
//       const quantity = row.getValue("quantity");

//       return <div className="w-full">{quantity}x</div>;
//     },
//   },

//   {
//     accessorKey: "amount",
//     header: "Amount",
//     cell: ({ row }) => {
//       const amount = parseFloat(row.getValue("amount"));

//       // Format the amount as a dollar amount
//       const formatted = new Intl.NumberFormat("en-US", {
//         style: "currency",
//         currency: "INR",
//       }).format(amount);

//       return <div className="w-full">{formatted}</div>;
//     },
//   },
//   {
//     accessorKey: "orderTime",
//     header: "Order Time",
//     cell: ({ row }) => <div>{row.getValue("orderTime")}</div>,
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//     cell: ({ row }) => {
//       const status = row.getValue("status");

//       return (
//         <div className="flex items-center gap-2">
//           <Circle
//             size={8}
//             fill={STATUS_COLORS[status]}
//             color={STATUS_COLORS[status]}
//           />
//           {STATUS_TEXT[status]}
//         </div>
//       );
//     },
//   },
//   {
//     accessorKey: "actions",
//     header: "Actions",
//     cell: () => {
//       return (
//         <DropdownMenu>
//           <DropdownMenuTrigger asChild>
//             <Button aria-haspopup="true" size="icon" variant="ghost">
//               <MoreHorizontal className="w-4 h-4" />
//               <span className="sr-only">Toggle menu</span>
//             </Button>
//           </DropdownMenuTrigger>
//           <DropdownMenuContent align="end">
//             <DropdownMenuLabel>Actions</DropdownMenuLabel>
//             <DropdownMenuItem>
//               <Button variant="ghost" size="sm">
//                 Start Preparing
//               </Button>
//             </DropdownMenuItem>
//             <DropdownMenuItem>
//               <Button variant="ghost" size="sm">
//                 Mark as Completed
//               </Button>
//             </DropdownMenuItem>
//           </DropdownMenuContent>
//         </DropdownMenu>
//       );
//     },
//   },
// ];
