import { Plus } from "lucide-react";
import { Button } from "components/ui/button";
import { TableGrid } from "./components/TableGrid";
import { TableFilters } from "./components/TableFilters";
import { AddTableDialog } from "./components/AddTableDialog";
import Layout from "components/Layout";
import { TableSummary } from "./components/TableSummary";

export default function TablesPage() {
  return (
    <Layout>
      {/* <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Table Management
            </h1>
            <p className="text-sm text-muted-foreground">
              View and manage restaurant tables
            </p>
          </div>
          <AddTableDialog>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add New Table
            </Button>
          </AddTableDialog>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <TableFilters />
          <TableGrid />
        </div>
      </div> */}
      <div className="flex flex-col h-full">
        <div className="flex sm:items-center justify-between p-4 border-b sm:flex-row flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Table Management
            </h1>
            <p className="text-sm text-muted-foreground">
              View and manage restaurant tables
            </p>
          </div>
          <AddTableDialog>
            <Button className="flex items-center gap-2 max-w-fit px-4 self-end">
              <Plus className="h-4 w-4 mr-2" />
              Add New Table
            </Button>
          </AddTableDialog>
        </div>
        <div className="p-4 space-y-4 flex-1">
          <TableGrid />
        </div>
      </div>
    </Layout>
  );
}
