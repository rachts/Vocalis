"use client";

import { useState } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setQuery("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md relative group">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <Search size={18} className="text-[var(--color-stone)] group-focus-within:text-[var(--color-glow)] transition-colors" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask Jarvis..."
        className="w-full bg-[var(--color-paper)] border border-[var(--color-parchment)] rounded-full pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-[var(--color-glow-soft)] focus:ring-2 focus:ring-[var(--color-glow-soft)] text-[var(--color-ink)] placeholder:text-[var(--color-stone)] transition-all font-body shadow-sm"
      />
    </form>
  );
}
