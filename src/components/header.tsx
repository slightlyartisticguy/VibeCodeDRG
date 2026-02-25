/**
 * Header component with search bar for finding markets and assets.
 * Matches the dark translucent header from the Figma design.
 */
"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSymbolSearch } from "@/hooks/use-market-data";

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
}

interface HeaderProps {
  onSymbolSelect?: (symbol: string) => void;
}

export function Header({ onSymbolSelect }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: results = [], isLoading } = useSymbolSearch(query);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (result: SearchResult) => {
    setQuery("");
    setIsOpen(false);
    onSymbolSelect?.(result.symbol);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#1a1a1a]/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-center px-8">
        <div className="relative w-96" ref={dropdownRef}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Search markets, assets..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => query.length > 0 && setIsOpen(true)}
            className="h-10 rounded-lg border-0 bg-[#262626] pl-10 text-sm text-slate-300 placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-blue-500"
          />

          {/* Search Results Dropdown */}
          {isOpen && query.length > 0 && (
            <div className="absolute top-full mt-1 w-full rounded-lg border border-slate-700 bg-[#1a1a1a] shadow-xl">
              {isLoading ? (
                <div className="px-4 py-3 text-sm text-slate-400">
                  Searching...
                </div>
              ) : results.length > 0 ? (
                <ul className="max-h-64 overflow-auto py-1">
                  {results.slice(0, 8).map((result: SearchResult) => (
                    <li key={result.symbol}>
                      <button
                        onClick={() => handleSelect(result)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-800/50 transition-colors"
                      >
                        <span className="min-w-[60px] rounded bg-slate-800 px-2 py-0.5 text-xs font-bold text-blue-400">
                          {result.symbol}
                        </span>
                        <span className="truncate text-sm text-slate-300">
                          {result.name}
                        </span>
                        <span className="ml-auto text-xs text-slate-500">
                          {result.type}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-sm text-slate-400">
                  No results found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
