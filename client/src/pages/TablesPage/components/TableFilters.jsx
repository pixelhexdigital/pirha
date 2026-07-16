import { X } from "lucide-react";

import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import { Label } from "components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";

export function TableFilters({
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
}) {
  const { status, minCapacity } = filter;
  const hasActiveFilters = Boolean(searchQuery || status || minCapacity);

  const setStatus = (value) => {
    if (value === "All") {
      value = "";
    }
    setFilter((prev) => ({
      ...prev,
      status: value,
    }));
  };

  const setCapacity = (value) => {
    setFilter((prev) => ({
      ...prev,
      minCapacity: value,
    }));
  };

  const clearAll = () => {
    setSearchQuery("");
    setFilter((prev) => ({ ...prev, status: "", minCapacity: "" }));
  };

  return (
    <div className="grid grid-cols-1 gap-4 mt-4 mb-6 md:grid-cols-3 lg:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor="search-filter">Search</Label>
        <Input
          id="search-filter"
          placeholder="Search by table number or name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="status-filter">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            <SelectItem value="Free">Available</SelectItem>
            <SelectItem value="Occupied">Occupied</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="capacity-filter">Minimum Capacity</Label>
        <Input
          id="capacity-filter"
          type="number"
          min="1"
          value={minCapacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Enter minimum capacity"
        />
      </div>
      {hasActiveFilters && (
        <div className="flex items-end">
          <Button
            variant="ghost"
            onClick={clearAll}
            className="gap-2 text-muted-foreground"
          >
            <X className="size-4" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
