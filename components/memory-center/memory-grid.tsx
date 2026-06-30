import { MemoryType } from "./memory-detail"

interface MemoryGridProps {
  memories: MemoryType[];
  onSelect: (memory: MemoryType) => void;
  selectedId: string | null;
}

export function MemoryGrid({ memories, onSelect, selectedId }: MemoryGridProps) {
  if (memories.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-on-surface-variant font-mono-data opacity-50">
        No memories found.
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
      <div className="masonry-grid">
        {memories.map(mem => (
          <MemoryCard 
            key={mem.id} 
            memory={mem} 
            isSelected={mem.id === selectedId} 
            onClick={() => onSelect(mem)} 
          />
        ))}
      </div>
    </div>
  )
}

function MemoryCard({ memory, isSelected, onClick }: { memory: MemoryType, isSelected: boolean, onClick: () => void }) {
  const isKnowledge = memory.category === 'KNOWLEDGE';
  const isCode = memory.category === 'CODE';
  const isPeople = memory.category === 'PEOPLE';
  const isFile = memory.category === 'FILE';

  let iconName = "description";
  let colorClass = "text-primary";
  let colorBg = "bg-primary/20";
  let colorBorder = "border-primary/30";

  if (isKnowledge) {
    iconName = "psychology";
    colorClass = "text-tertiary-container";
    colorBg = "bg-tertiary-container/20";
    colorBorder = "border-tertiary-container/30";
  } else if (isCode) {
    iconName = "code";
    colorClass = "text-secondary";
    colorBg = "bg-secondary/20";
    colorBorder = "border-secondary/30";
  } else if (isPeople) {
    iconName = "person";
    colorClass = "text-error-container";
    colorBg = "bg-error-container/20";
    colorBorder = "border-error-container/30";
  }

  const baseCardClass = "masonry-item rounded-xl relative overflow-hidden cursor-pointer group transition-colors " +
    (isSelected 
      ? "bg-surface-container-high border " + colorBorder + " shadow-[0_0_15px_rgba(192,193,255,0.05)]" 
      : "glass-card hover:bg-white/5 p-5");

  return (
    <div onClick={onClick} className={baseCardClass}>
      {isSelected && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-inverse-primary opacity-50"></div>
      )}
      
      {isCode && !isSelected && (
        <div className="h-32 bg-surface-container-highest relative -mx-5 -mt-5 mb-5">
           <div className="w-full h-full bg-cover bg-center opacity-50" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB40csP0W7dicHR2HsdgxLXsdop_6MOyPE_nYL6Rm1-NBkqqgQzL0Hxe4rdq8IRre8MpBj_KT6N86_jrjck11vT0Tucr22nthpWh0QA0ij9THBXrVVOY2JoBKFwb48Kr6DAZa0_EhQjki2wLFmSJ9pGkzt4igfqKz8NZxMaXDdwwzkph_WDVcZ9i1BZmXzJYnpMf_A8T5d665DSVOy-k8InBDS54SoBRj5QPN49dSe7HyTW5EeCTVDrfIBnmKFLj8tMSkFec6friU2U')" }}></div>
        </div>
      )}

      <div className={`${isSelected ? 'p-5' : ''}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className={`material-symbols-outlined text-sm ${colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>{iconName}</span>
          <span className={`font-mono-label text-mono-label ${colorClass}`}>{memory.category}</span>
          <span className="font-mono-label text-mono-label text-on-surface-variant ml-auto">
            {new Date(memory.timestamp).toLocaleDateString()}
          </span>
        </div>
        <h3 className="font-body-md text-body-md font-semibold text-on-surface mb-2">{memory.title}</h3>
        <p className={`font-body-sm text-body-sm text-on-surface-variant ${isCode && !isSelected ? 'line-clamp-2' : 'line-clamp-3'}`}>{memory.content}</p>
        
        {isFile && (
          <div className="mt-4 flex gap-2">
            <span className="text-xs bg-white/5 px-2 py-1 rounded text-on-surface-variant">Extracted</span>
          </div>
        )}
        
        {isPeople && (
          <div className="mt-4 flex -space-x-2">
            <div className={`w-6 h-6 rounded-full border border-background flex items-center justify-center text-[10px] ${colorBg} ${colorClass}`}>O</div>
          </div>
        )}
      </div>
    </div>
  )
}
