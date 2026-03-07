import { Moon, Sun, Monitor } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { useTheme } from "components/ThemeProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "components/ui/tooltip";

const ThemeToggle = ({ collapsed = false }) => {
  const { theme, setTheme } = useTheme();

  const nextTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const icon =
    theme === "dark" ? (
      <Moon className="size-4" />
    ) : theme === "system" ? (
      <Monitor className="size-4" />
    ) : (
      <Sun className="size-4" />
    );

  const label =
    theme === "dark" ? "Dark" : theme === "system" ? "System" : "Light";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={nextTheme}
          type="button"
          aria-label={`Theme: ${label}`}
          className={twMerge(
            "flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <span className="shrink-0">{icon}</span>
          {!collapsed && <span>{label}</span>}
        </button>
      </TooltipTrigger>
      {collapsed && (
        <TooltipContent side="right">Theme: {label}</TooltipContent>
      )}
    </Tooltip>
  );
};

export default ThemeToggle;
