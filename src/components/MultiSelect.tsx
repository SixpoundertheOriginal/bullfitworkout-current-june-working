
import * as React from "react";
import { X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options = [],
  selected = [],
  onChange,
  placeholder = "Select options",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  
  // Ensure options and selected are always arrays
  const safeOptions = Array.isArray(options) ? options : [];
  const safeSelected = Array.isArray(selected) ? selected : [];
  
  const handleSelect = (currentValue: string) => {
    const isSelected = safeSelected.includes(currentValue);
    
    if (isSelected) {
      onChange(safeSelected.filter((value) => value !== currentValue));
    } else {
      onChange([...safeSelected, currentValue]);
    }
  };

  const handleRemove = (currentValue: string) => {
    onChange(safeSelected.filter((value) => value !== currentValue));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <div className="flex gap-1 flex-wrap">
            {safeSelected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {safeSelected.map((value) => {
              const option = safeOptions.find((opt) => opt.value === value);
              return (
                <Badge
                  key={value}
                  variant="secondary"
                  className="mr-1 mb-1 flex items-center gap-1"
                >
                  {option?.label || value}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleRemove(value)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
          <div className="shrink-0 opacity-50">{safeSelected.length > 0 && `${safeSelected.length} selected`}</div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command className="w-full">
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {safeOptions.map((option) => {
              const isSelected = safeSelected.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>{option.label}</span>
                  {isSelected ? <Check className="h-4 w-4" /> : null}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
