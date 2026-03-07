import { Plus } from "lucide-react";
import { Button } from "components/ui/button";
import { TableGrid } from "./components/TableGrid";
import { AddTableDialog } from "./components/AddTableDialog";
import Layout from "components/Layout";
import PageHeader from "components/PageHeader";

export default function TablesPage() {
  return (
    <Layout>
      <div className="flex flex-col h-full">
        <PageHeader
          title="Table Management"
          description="View and manage restaurant tables"
        >
          <AddTableDialog>
            <Button className="flex items-center gap-2 px-4">
              <Plus className="h-4 w-4" />
              Add New Table
            </Button>
          </AddTableDialog>
        </PageHeader>
        <div className="p-4 space-y-4 flex-1">
          <TableGrid />
        </div>
      </div>
    </Layout>
  );
}
