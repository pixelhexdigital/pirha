import { Moon, Sun, Monitor } from "lucide-react";

import { useTheme } from "components/ThemeProvider";
import { Button } from "components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/ui/tooltip";

const ThemeToggleButton = () => {
  const { theme, setTheme } = useTheme();

  const nextTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  const label =
    theme === "dark" ? "Dark" : theme === "system" ? "System" : "Light";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={nextTheme}
            aria-label={`Theme: ${label}`}
          >
            {theme === "dark" ? (
              <Moon className="size-5" />
            ) : theme === "system" ? (
              <Monitor className="size-5" />
            ) : (
              <Sun className="size-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Theme: {label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggleButton;
