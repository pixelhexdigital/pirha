import { LayoutGrid, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";

const summaryCards = [
  {
    key: "totalTables",
    title: "Total Tables",
    icon: LayoutGrid,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    key: "availableTables",
    title: "Available Tables",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    key: "occupiedTables",
    title: "Occupied Tables",
    icon: XCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

export function TableSummary({ data }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {summaryCards.map(({ key, title, icon: Icon, color, bg }) => (
        <Card key={key}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`size-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${color}`}>{data?.[key]}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
