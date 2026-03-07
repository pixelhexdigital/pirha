import { Tabs, TabsList, TabsTrigger } from "components/ui/tabs";

export function OrderTabs({
  orderStatuses = [],
  onStatusChange = () => {},
  defaultValue = "New",
}) {
  return (
    <Tabs
      onValueChange={onStatusChange}
      defaultValue={defaultValue}
      className="w-full"
    >
      <TabsList className="flex flex-wrap h-auto gap-2 p-1 rounded-lg">
        {orderStatuses.map((status) => (
          <TabsTrigger
            key={status.value}
            value={status.value}
          >
            {status.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
