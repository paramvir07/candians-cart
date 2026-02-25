"use client";

import React, { useState } from "react";
import { Search, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Define a generic type for the expected server action response
type SearchResponse<T> = 
  | { success: true; data: T[] }
  | { success: false; error: string };

// Define the props using the Generic type <T>
interface SearchBarProps<T> {
  placeholder?: string;
  // The server action to execute
  searchAction: (query: string) => Promise<SearchResponse<T>>;
  // Callback to pass the data back to the parent component
  onResults: (data: T[]) => void;
  // Optional callback for when the search starts (useful for setting a parent loading state)
  onSearchStart?: () => void;
  className?: string;
}

export function SearchBar<T>({
  placeholder = "Search...",
  searchAction,
  onResults,
  onSearchStart,
  className = "",
}: SearchBarProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const executeSearch = async (queryToSearch: string) => {
    setIsSearching(true);
    if (onSearchStart) onSearchStart();

    try {
      const result = await searchAction(queryToSearch);
      
      if (result.success) {
        onResults(result.data);
      } else {
        toast.error(result.error || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("An unexpected error occurred during search.");
    } finally {
      setIsSearching(false);
    }
  };

const handleSearch: React.SubmitEventHandler<HTMLFormElement> = (e) => {
  e.preventDefault();
  executeSearch(searchQuery);
};

  const handleClear = () => {
    setSearchQuery("");
    // Optionally trigger a search with an empty string to reset the list
    executeSearch(""); 
  };

  return (
    <form onSubmit={handleSearch} className={`flex w-full max-w-sm gap-2 ${className}`}>
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        
        <Input
          type="text"
          placeholder={placeholder}
          className="pl-10 pr-10 bg-white border-slate-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Clear Button (only shows when there's text) */}
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <Button type="submit" disabled={isSearching}>
        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
      </Button>
    </form>
  );
}