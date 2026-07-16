"use client";

import { useState, useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, ChefHat } from "lucide-react";

interface CuisineDialogProps {
  cuisines: { id: string; name: string; kitchenCount: number }[];
  selectedCuisines: string[];
  onCuisinesChange: (cuisines: string[]) => void;
}

export function CuisineDialog({
  cuisines,
  selectedCuisines,
  onCuisinesChange,
}: CuisineDialogProps) {
  const [search, setSearch] = useState("");
  const [localSelected, setLocalSelected] = useState<string[]>(selectedCuisines);

  const filteredCuisines = useMemo(
    () =>
      cuisines.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [cuisines, search]
  );

  const handleToggle = (id: string) => {
    setLocalSelected((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
    );
  };

  const handleApply = () => {
    onCuisinesChange(localSelected);
  };

  const handleClear = () => {
    setLocalSelected([]);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setLocalSelected(selectedCuisines);
      setSearch("");
    }
  };

  const selectedCount = localSelected.length;

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium transition-shadow whitespace-nowrap bg-white shadow-sm hover:shadow-md",
            selectedCuisines.length > 0 && "text-primary"
          )}
        >
          <ChefHat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>
            Cuisine
            {selectedCuisines.length > 0 && ` (${selectedCuisines.length})`}
          </span>
        </button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-32px)] sm:max-w-sm rounded-xl p-0 gap-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 border-b border-border/50">
          <DialogTitle className="text-base sm:text-lg font-bold">Filter by Cuisine</DialogTitle>
        </DialogHeader>

        <div className="px-4 sm:px-5 py-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search cuisines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-background text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex-1 px-4 sm:px-5 py-2 max-h-[50vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-track]:bg-transparent">
          {filteredCuisines.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No cuisines found
            </p>
          ) : (
            <div className="space-y-1">
              {filteredCuisines.map((cuisine) => (
                <label
                  key={cuisine.id}
                  className="flex items-center gap-3 py-2.5 sm:py-3 cursor-pointer"
                >
                  <Checkbox
                    checked={localSelected.includes(cuisine.id)}
                    onCheckedChange={() => handleToggle(cuisine.id)}
                    className="h-5 w-5 rounded-full border-2 data-checked:bg-primary data-checked:border-primary [&>svg]:text-white [&>svg]:h-3 [&>svg]:w-3"
                  />
                  <span className="text-sm sm:text-base text-foreground flex-1">{cuisine.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 sm:px-5 py-3 sm:py-4 border-t border-border/50 flex flex-col gap-2">
          <DialogClose asChild>
            <Button
              onClick={handleApply}
              className="rounded-lg w-full"
              size="lg"
            >
              Apply{selectedCount > 0 ? ` (${selectedCount})` : ""}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <button
              onClick={handleClear}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2 text-center"
            >
              Clear Filters
            </button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
