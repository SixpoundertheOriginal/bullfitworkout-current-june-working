
import React from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from '@/lib/utils';

export interface SearchableListProps<T> {
  items: T[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
  searchPlaceholder?: string;
  className?: string;
  listClassName?: string;
}

export const SearchableList = <T,>({
  items,
  searchQuery,
  onSearchChange,
  renderItem,
  emptyMessage = "No items found",
  searchPlaceholder = "Search...",
  className,
  listClassName
}: SearchableListProps<T>) => {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder={searchPlaceholder}
          className="pl-9 bg-gray-800 border-gray-700"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Items List */}
      <div className={cn(
        "flex-1 overflow-auto",
        "max-h-[calc(85vh-300px)]",
        listClassName
      )}>
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {items.map((item, index) => renderItem(item, index))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
