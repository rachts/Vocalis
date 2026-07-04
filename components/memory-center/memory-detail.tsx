import { Icon } from "@/components/ui/icon"
import { motion, AnimatePresence } from "framer-motion"

export interface MemoryType {
  id: string;
  title: string;
  content: string;
  category: string;
  timestamp: string;
  source: string;
  lastAccessed: string;
  importanceScore: number;
  archived: boolean;
  relatedMemoryIds?: string[];
}

interface MemoryDetailProps {
  memory: MemoryType | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRelatedClick?: (id: string) => void;
}

export function MemoryDetail({ memory, onClose, onDelete, onArchive, onRelatedClick }: MemoryDetailProps) {
  if (!memory) return null;

  let iconName = "psychology";
  let colorClass = "text-tertiary-container";

  if (memory.category === "CODE") {
    iconName = "code";
    colorClass = "text-secondary";
  } else if (memory.category === "PEOPLE") {
    iconName = "person";
    colorClass = "text-error-container";
  } else if (memory.category === "FILE") {
    iconName = "description";
    colorClass = "text-primary";
  } else if (memory.category === "TASK") {
    iconName = "task_alt";
    colorClass = "text-primary-container";
  } else if (memory.category === "CONVERSATION") {
    iconName = "forum";
    colorClass = "text-secondary-container";
  } else if (memory.category === "PROJECT") {
    iconName = "account_tree";
    colorClass = "text-tertiary";
  } else if (memory.category === "SYSTEM") {
    iconName = "memory";
    colorClass = "text-error";
  }

  const importanceColor = memory.importanceScore > 80 ? "text-error-container" : (memory.importanceScore > 50 ? "text-primary" : "text-on-surface-variant");

  return (
    <AnimatePresence>
      <motion.aside 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 100, opacity: 0 }}
        className="hidden lg:flex w-96 glass-panel rounded-xl flex-col h-full shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10"></div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className={`material-symbols-outlined ${colorClass}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  {iconName}
                </span>
                <span className={`font-mono-label text-mono-label ${colorClass}`}>{memory.category}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant">bolt</span>
                <span className={`font-mono-data text-[11px] ${importanceColor}`}>Impact: {memory.importanceScore}/100</span>
              </div>
            </div>
            <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors bg-white/5 hover:bg-white/10 p-1 rounded-full border border-white/5">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">{memory.title}</h2>
          
          <div className="flex flex-col gap-1 mb-6 border-b border-white/5 pb-4">
            <p className="font-mono-data text-mono-data text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">calendar_today</span>
              Recorded: {new Date(memory.timestamp).toLocaleString()}
            </p>
            <p className="font-mono-data text-mono-data text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[14px]">history</span>
              Accessed: {new Date(memory.lastAccessed).toLocaleString()}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-mono-label text-mono-label text-on-surface-variant mb-2">CONTENT</h4>
              <p className="font-body-sm text-body-sm text-on-surface break-words whitespace-pre-wrap">{memory.content}</p>
            </div>
            
            <div>
              <h4 className="font-mono-label text-mono-label text-on-surface-variant mb-2">SOURCE</h4>
              <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                <span className="material-symbols-outlined text-on-surface-variant">chat</span>
                <span className="font-body-sm text-body-sm text-on-surface">{memory.source}</span>
                <span className="material-symbols-outlined text-on-surface-variant ml-auto text-sm">arrow_forward</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-mono-label text-mono-label text-on-surface-variant mb-2">CONNECTIONS</h4>
              <div className="flex flex-wrap gap-2">
                {memory.relatedMemoryIds && memory.relatedMemoryIds.length > 0 ? (
                  memory.relatedMemoryIds.map((id) => (
                    <button 
                      key={id}
                      onClick={() => onRelatedClick && onRelatedClick(id)}
                      className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full font-body-sm text-body-sm text-primary border border-primary/20 flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">link</span> {id.substring(0, 15)}...
                    </button>
                  ))
                ) : (
                  <span className="text-on-surface-variant font-body-sm text-sm italic">No related memories</span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-white/5 bg-surface-container/50 flex justify-between gap-2">
          <button className="flex-1 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface font-body-sm text-body-sm transition-colors border border-white/5 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">edit</span> Edit
          </button>
          <button 
            onClick={() => onArchive && onArchive(memory.id)}
            className="flex-1 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-on-surface font-body-sm text-body-sm transition-colors border border-white/5 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">archive</span> {memory.archived ? 'Unarchive' : 'Archive'}
          </button>
          <button 
            onClick={() => onDelete && onDelete(memory.id)}
            className="w-10 flex items-center justify-center rounded-lg bg-error-container/10 text-error hover:bg-error-container/20 transition-colors border border-error/10"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
