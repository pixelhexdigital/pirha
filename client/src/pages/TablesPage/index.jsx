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
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add table
            </Button>
          </AddTableDialog>
        </PageHeader>
        <div className="flex-1">
          <TableGrid />
        </div>
      </div>
    </Layout>
  );
}
