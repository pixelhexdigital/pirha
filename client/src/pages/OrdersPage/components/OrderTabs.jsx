import { Tabs, TabsList, TabsTrigger } from "components/ui/tabs";

const orderStatuses = [
  {
    value: "new",
    label: "New Order",
    count: 6,
  },
  {
    value: "ready",
    label: "Ready",
    count: 2,
  },
  {
    value: "served",
    label: "Served",
    count: 3,
  },
  {
    value: "cancelled",
    label: "Cancelled",
    count: 1,
  },
  {
    value: "billed",
    label: "Billed",
    count: 4,
  },
];

export function OrderTabs() {
  return (
    <Tabs defaultValue="new" className="w-full">
      <TabsList className="flex flex-wrap h-auto gap-2 p-0 bg-transparent">
        {orderStatuses.map((status) => (
          <TabsTrigger
            key={status.value}
            value={status.value}
            className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-500"
          >
            {status.label}
            <span className="ml-2 rounded-full bg-muted px-2 py-0.5 text-xs">
              {status.count}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
