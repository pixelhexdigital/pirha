import { Inbox } from "lucide-react";

const EmptyState = ({
  title = "No items found",
  description,
  icon: Icon = Inbox,
  children,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[200px]">
      <div className="flex items-center justify-center size-12 rounded-full bg-muted mb-4">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};

export default EmptyState;
