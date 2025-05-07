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

  const setStatus = (value) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 mt-2">
      <div>
        <Label htmlFor="search-filter">Search</Label>
        <Input
          id="search-filter"
          placeholder="Search by table number or name"
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
            <SelectItem value={null}>All</SelectItem>
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
          value={minCapacity}
          onChange={(e) => setCapacity(e.target.value)}
          placeholder="Enter minimum capacity"
        />
      </div>
    </div>
  );
}
