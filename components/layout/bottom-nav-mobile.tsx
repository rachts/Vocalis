import { Keyboard, Mic, Zap } from "lucide-react"

interface BottomNavMobileProps {
  isTextMode: boolean;
  setIsTextMode: (val: boolean) => void;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
}

export function BottomNavMobile({
  isTextMode,
  setIsTextMode,
  isListening,
  startListening,
  stopListening
}: BottomNavMobileProps) {
  return (
    <div className="fixed bottom-0 w-full flex justify-center pb-xl z-50 md:hidden block">
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-fit rounded-full px-lg py-sm shadow-2xl bg-surface-container-highest/60 backdrop-blur-3xl border border-white/20 text-primary font-mono-label text-mono-label flex items-center gap-md">
        
        <button 
          onClick={() => setIsTextMode(true)}
          className={`p-2 rounded-full hover:scale-110 transition-transform active:scale-90 duration-150 flex items-center gap-xs ${
            isTextMode ? "bg-on-primary-fixed-variant text-primary-fixed" : "text-on-surface-variant"
          }`}
        >
          <Keyboard className="w-5 h-5" />
          <span className="hidden sm:inline">Command</span>
        </button>

        <button 
          onClick={() => {
            setIsTextMode(false)
            if (isListening) stopListening()
            else startListening()
          }}
          className={`p-2 rounded-full hover:scale-110 transition-transform active:scale-90 duration-150 flex items-center gap-xs ${
            !isTextMode && isListening ? "bg-red-500/20 text-red-500" : 
            !isTextMode ? "bg-on-primary-fixed-variant text-primary-fixed" : "text-on-surface-variant"
          }`}
        >
          <Mic className="w-5 h-5" />
          <span className="hidden sm:inline">Voice</span>
        </button>

        <button className="text-on-surface-variant p-2 hover:scale-110 transition-transform active:scale-90 duration-150 flex items-center gap-xs">
          <Zap className="w-5 h-5" />
          <span className="hidden sm:inline">Actions</span>
        </button>

      </nav>
    </div>
  )
}
