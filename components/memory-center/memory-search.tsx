import { Icon } from "@/components/ui/icon"

interface MemorySearchProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeFilter: string;
  setActiveFilter: (val: string) => void;
  minImportance: number;
  setMinImportance: (val: number) => void;
  sortBy: string;
  setSortBy: (val: string) => void;
}

const filters = ["All Memories", "Knowledge", "Code", "People", "Files", "Task", "Conversation", "Project", "System"];
const sortOptions = ["Newest", "Oldest", "Most Important", "Recently Accessed"];

export function MemorySearch({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  minImportance,
  setMinImportance,
  sortBy,
  setSortBy
}: MemorySearchProps) {
  return (
    <header className="p-4 md:p-margin-desktop shrink-0 z-20">
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-primary/70 group-focus-within:text-primary transition-colors">search</span>
          </div>
          <input 
            className="w-full bg-surface-container-high/50 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 transition-all backdrop-blur-md shadow-lg" 
            placeholder="Search memories, files, or concepts..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2 pointer-events-none">
            <kbd className="font-mono-label text-mono-label bg-white/5 px-2 py-1 rounded text-on-surface-variant">⌘</kbd>
            <kbd className="font-mono-label text-mono-label bg-white/5 px-2 py-1 rounded text-on-surface-variant">K</kbd>
          </div>
        </div>
        
        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide flex-1">
            {filters.map(filter => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-1.5 rounded-full font-body-sm text-body-sm whitespace-nowrap transition-colors ${
                  activeFilter === filter 
                    ? "bg-primary/20 text-primary border border-primary/30" 
                    : "bg-white/5 text-on-surface-variant hover:bg-white/10 hover:text-on-surface border border-white/5"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <span className="text-on-surface-variant text-xs font-mono-label uppercase tracking-widest">Min Impact:</span>
              <input 
                type="range" 
                min="0" max="100" 
                value={minImportance}
                onChange={(e) => setMinImportance(parseInt(e.target.value))}
                className="w-20 accent-primary"
              />
              <span className="text-on-surface text-xs font-mono-data w-6">{minImportance}</span>
            </div>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 text-on-surface text-sm px-3 py-1.5 rounded-lg border border-white/5 outline-none focus:border-primary/50 transition-colors cursor-pointer"
            >
              {sortOptions.map(opt => (
                <option key={opt} value={opt} className="bg-surface-container-high text-on-surface">{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}
