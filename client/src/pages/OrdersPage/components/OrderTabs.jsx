import { Tabs, TabsList, TabsTrigger } from "components/ui/tabs";

export function OrderTabs({
  orderStatuses = [],
  onStatusChange = () => {},
  defaultValue = "New",
  counts = {},
}) {
  return (
    <Tabs
      onValueChange={onStatusChange}
      defaultValue={defaultValue}
      className="w-full"
    >
      <TabsList className="flex flex-wrap h-auto gap-2 p-1 rounded-lg">
        {orderStatuses.map((status) => {
          const count = counts?.[status.value];
          const hasCount = typeof count === "number" && count > 0;
          return (
            <TabsTrigger key={status.value} value={status.value} className="group">
              {status.label}
              {hasCount && (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-muted-foreground/15 px-1.5 text-xs font-medium tabular-nums text-muted-foreground group-data-[state=active]:bg-primary/10 group-data-[state=active]:text-primary">
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
