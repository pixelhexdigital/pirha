import { Search } from "lucide-react";

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

const PaymentStatuses = {
  all: "All Payments",
  paid: "Paid",
  unpaid: "Unpaid",
};

export function OrderFilters() {
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div className="relative md:col-span-3">
            <Search
              className="absolute left-2.5 top-3
           h-4 w-4 text-muted-foreground"
            />
            <Input
              type="search"
              placeholder="Search orders..."
              className="h-10 bg-white px-3.5 py-3 pl-8"
            />
          </div>
          {/* <Select defaultValue="all">
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Order Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OrderStatuses).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
          <Select defaultValue="all">
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="Payment Status" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PaymentStatuses).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" className="bg-white" />
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button variant="outline" size="sm">
              Print
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
