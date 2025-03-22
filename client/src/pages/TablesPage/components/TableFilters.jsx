import { useState } from "react";

import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

export function TableFilters() {
  const [status, setStatus] = useState("all");
  const [capacity, setCapacity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
      <div>
        <Label htmlFor="search-filter">Search</Label>
        <Input
          id="search-filter"
          placeholder="Search by table number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="status-filter">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Free">Available</SelectItem>
            <SelectItem value="Occupied">Occupied</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="capacity-filter">Minimum Capacity</Label>
        <Input
          id="capacity-filter"
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Enter minimum capacity"
        />
      </div>
    </div>
  );
}
