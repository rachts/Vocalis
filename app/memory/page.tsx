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
  const [selectedMemory, setSelectedMemory] = useState<MemoryType | null>(null)
  
  useEffect(() => {
    // Fetch memories
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
    fetchMemories()
  }, [])
  
  const filteredMemories = memories.filter(mem => {
    let filterKey = activeFilter.toUpperCase();
    if (activeFilter === 'Files') filterKey = 'FILE';
    
    if (activeFilter !== "All Memories" && !mem.category.includes(filterKey)) return false;
    
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      return mem.title.toLowerCase().includes(q) || mem.content.toLowerCase().includes(q);
    }
    return true;
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
          <MemoryDetail memory={selectedMemory} onClose={() => setSelectedMemory(null)} />
        </div>
      </div>
    </AppShell>
  )
}
