import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { cn } from "lib/utils";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export function Combobox({
  data,
  value,
  label,
  error,
  setValue,
  placeholder = "Select...",
  searchInputPlaceholder = "Search...",
  showSearchInput = false,
  buttonClassName,
}) {
  const [open, setOpen] = useState(false);

  const onSelect = (currentValue) => {
    setValue(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {label && (
        <div className="flex mb-2 text-sm font-medium text-foreground">
          {label}
        </div>
      )}
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={!!error}
          className={twMerge(
            "w-full justify-between h-12 px-3.5 py-3 rounded-lg text-sm font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive",
            buttonClassName
          )}
        >
          <span className="truncate">
            {value
              ? data?.find((items) => items?.value === value)?.label
              : placeholder}
          </span>
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          {showSearchInput && (
            <CommandInput placeholder={searchInputPlaceholder} />
          )}
          <CommandList>
            <CommandEmpty>No data found.</CommandEmpty>
            <CommandGroup>
              {data?.map(({ value: itemValue, label }) => (
                <CommandItem
                  key={itemValue}
                  value={itemValue}
                  onSelect={() => onSelect(itemValue)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === itemValue ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
      {error && (
        <div role="alert" className="mt-2 text-destructive text-xs font-medium">
          {error}
        </div>
      )}
    </Popover>
  );
}
