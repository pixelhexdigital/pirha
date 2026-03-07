import { RefreshCcw } from "lucide-react";
import { Button } from "components/ui/button";

const RefreshButton = ({ onClick, isLoading, isFetching }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-2 max-w-fit px-4"
      onClick={onClick}
      disabled={isLoading}
    >
      <RefreshCcw
        className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
      />
      Refresh
    </Button>
  );
};

export default RefreshButton;
