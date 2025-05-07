// src/components/MultiSelect.tsx

import * as React from "react";
import { X, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Option {
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

function MultiSelectImpl({
  options,
  selected,
  onChange,
  placeholder = "Select options",
  className
}: MultiSelectProps) {
  // Local open state stays stable across parent updates
  const [open, setOpen] = React.useState(false);

  // Memoize these to avoid re-creating arrays each render
  const safeOptions = React.useMemo(
    () => (Array.isArray(options) ? options : []),
    [options]
  );
  const safeSelected = React.useMemo(
    () => (Array.isArray(selected) ? selected : []),
    [selected]
  );

  // Stable handler references
  const handleSelect = React.useCallback(
    (value: string) => {
      const isSel = safeSelected.includes(value);
      onChange(isSel
        ? safeSelected.filter(v => v !== value)
        : [...safeSelected, value]);
    },
    [safeSelected, onChange]
  );

  const handleRemove = React.useCallback(
    (value: string) => {
      onChange(safeSelected.filter(v => v !== value));
    },
    [safeSelected, onChange]
  );

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <div
          role="combobox"
          aria-expanded={open}
          className={cn(
            "flex min-h-10 w-full items-center justify-between rounded-md border border-input " +
            "bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring " +
            "focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <div className="flex flex-wrap gap-1">
            {safeSelected.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              safeSelected.map(value => {
                const opt = safeOptions.find(o => o.value === value);
                return (
                  <Badge
                    key={value}
                    variant="secondary"
                    className="flex items-center gap-1 mb-1"
                  >
                    {opt?.label ?? value}
                    <button
                      onMouseDown={e => {e.preventDefault(); e.stopPropagation();}}
                      onClick={() => handleRemove(value)}
                      className="rounded-full focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })
            )}
          </div>
          <div className={safeSelected.length > 0 ? "opacity-100" : "opacity-50"}>
            {safeSelected.length > 0 && `${safeSelected.length} selected`}
          </div>
        </div>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0" align="start">
        <Command loop>
          <CommandInput placeholder={`Search ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>No options found.</CommandEmpty>
          <CommandGroup>
            {safeOptions.map(option => {
              const isSel = safeSelected.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                  className="flex items-center justify-between"
                >
                  <span>{option.label}</span>
                  {isSel && <Check className="h-4 w-4" />}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Export a memoized wrapper so parent re-renders don’t tear it down
export const MultiSelect = React.memo(MultiSelectImpl);
