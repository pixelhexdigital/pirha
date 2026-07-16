import { LayoutGrid, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";

// Color lives in the small icon chip only; the counts stay neutral and
// readable (magenta is reserved for actions/live status, not metrics).
const summaryCards = [
  {
    key: "totalTables",
    title: "Total tables",
    icon: LayoutGrid,
    color: "text-foreground",
    bg: "bg-muted",
  },
  {
    key: "availableTables",
    title: "Available",
    icon: CheckCircle2,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    key: "occupiedTables",
    title: "Occupied",
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
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${bg}`}>
              <Icon className={`size-4 ${color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {data?.[key]}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
