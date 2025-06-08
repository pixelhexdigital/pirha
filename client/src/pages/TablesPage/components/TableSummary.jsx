import { Card, CardContent, CardHeader, CardTitle } from "components/ui/card";

export function TableSummary({ data }) {
  // // This data would typically come from an API or be calculated based on the tables state
  // const summaryData = {
  //   totalTables: 20,
  //   availableTables: 8,
  //   occupiedTables: 10,
  // };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data?.totalTables}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Available Tables
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {data?.availableTables}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Occupied Tables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {data?.occupiedTables}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
