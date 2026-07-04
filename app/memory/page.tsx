"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { MemorySearch } from "@/components/memory-center/memory-search"
import { MemoryGrid } from "@/components/memory-center/memory-grid"
import { MemoryDetail, MemoryType } from "@/components/memory-center/memory-detail"

export default function MemoryCenterPage() {
  const [isTextMode, setIsTextMode] = useState(false)
  const [showTerminal, setShowTerminal] = useState(false)
  
  const [memories, setMemories] = useState<MemoryType[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Memories")
  const [minImportance, setMinImportance] = useState(0)
  const [sortBy, setSortBy] = useState("Newest")
  const [selectedMemory, setSelectedMemory] = useState<MemoryType | null>(null)
  
  useEffect(() => {
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      const res = await fetch(`${apiUrl}/api/memory`)
      const data = await res.json()
      if (data.memories) {
        setMemories(data.memories)
      }
    } catch (err) {
      console.error("Failed to fetch memories", err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      await fetch(`${apiUrl}/api/memory/${id}`, { method: 'DELETE' })
      setSelectedMemory(null)
      fetchMemories()
    } catch (err) {
      console.error(err)
    }
  }

  const handleArchive = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
      await fetch(`${apiUrl}/api/memory/${id}/archive`, { method: 'POST' })
      setSelectedMemory(null)
      fetchMemories()
    } catch (err) {
      console.error(err)
    }
  }
  
  const filteredMemories = memories
    .filter(mem => !mem.archived) // Hide archived by default for this view
    .filter(mem => {
      let filterKey = activeFilter.toUpperCase();
      if (activeFilter === 'Files') filterKey = 'FILE';
      
      if (activeFilter !== "All Memories" && !mem.category.includes(filterKey)) return false;
      
      if (mem.importanceScore < minImportance) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return mem.title.toLowerCase().includes(q) || mem.content.toLowerCase().includes(q) || mem.category.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "Oldest":
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case "Most Important":
          return b.importanceScore - a.importanceScore;
        case "Recently Accessed":
          return new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime();
        case "Newest":
        default:
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
    });

  return (
    <AppShell 
      isTextMode={isTextMode} 
      setIsTextMode={setIsTextMode}
      showTerminal={showTerminal}
      setShowTerminal={setShowTerminal}
      hideRightPanel={true}
    >
      <div className="w-full h-full flex flex-col relative z-0 overflow-hidden">
        <MemorySearch 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          minImportance={minImportance}
          setMinImportance={setMinImportance}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />
        
        {/* Memory Cluster Visualization */}
        <div className="absolute inset-0 pointer-events-none z-0 opacity-30 flex items-center justify-center">
          <div className="w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        </div>
        
        <div className="flex-1 flex overflow-hidden z-10 p-4 md:px-margin-desktop md:pb-margin-desktop gap-lg">
          <MemoryGrid 
            memories={filteredMemories} 
            onSelect={setSelectedMemory} 
            selectedId={selectedMemory?.id || null} 
          />
          <MemoryDetail 
            memory={selectedMemory} 
            onClose={() => setSelectedMemory(null)} 
            onDelete={handleDelete}
            onArchive={handleArchive}
            onRelatedClick={(id) => {
              const rel = memories.find(m => m.id === id);
              if (rel) setSelectedMemory(rel);
            }}
          />
        </div>
      </div>
    </AppShell>
  )
}
