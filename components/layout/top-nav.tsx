import { Icon } from "@/components/ui/icon"

interface TopNavBarProps {
  isTextMode: boolean;
  setIsTextMode: (val: boolean) => void;
  isScreenShared: boolean;
  startScreenShare: () => void;
  showTerminal: boolean;
  setShowTerminal: (val: boolean) => void;
  isOnline: boolean;
}

export function TopNavBar({
  isTextMode,
  setIsTextMode,
  isScreenShared,
  startScreenShare,
  showTerminal,
  setShowTerminal,
  isOnline
}: TopNavBarProps) {
  return (
    <nav className="hidden md:flex justify-between items-center px-margin-desktop py-md w-full z-40 fixed top-0 glass-nav text-primary font-body-md text-body-md duration-200">
      <div className="font-display-lg text-headline-lg-mobile tracking-tighter text-on-surface font-headline-lg font-mono">
        VOCALIS OS <span className="text-xs text-primary/60 align-top">[SYS.CORE]</span>
      </div>

      <div className="flex gap-lg">
        {/* Optional Vision Toggle - adapted for V2 but keeping functionality */}
        <button 
          onClick={() => !isScreenShared && startScreenShare()}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest border transition-colors ${
            isScreenShared 
              ? "text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.5)] border-primary/50 bg-primary/10" 
              : "text-on-surface-variant border-white/10 hover:text-on-surface glass-panel"
          }`}
        >
          <Icon name={isScreenShared ? "visibility" : "visibility_off"} size={14} />
          VISION
        </button>
        <button 
          onClick={() => setIsTextMode(false)}
          className={`font-mono text-body-md transition-colors uppercase text-sm tracking-widest ${!isTextMode ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
        >
          Voice
        </button>
        <button 
          onClick={() => setIsTextMode(true)}
          className={`font-mono text-body-md transition-colors uppercase text-sm tracking-widest ${isTextMode ? "text-primary" : "text-on-surface-variant hover:text-primary"}`}
        >
          Text
        </button>
      </div>

      <div className="flex gap-md text-on-surface-variant items-center">
        <button className={`hover:text-primary transition-colors ${isOnline ? 'text-primary animate-pulse' : 'text-error'}`}>
          <Icon name="wifi" size={20} />
        </button>
        <button 
          onClick={() => setShowTerminal(!showTerminal)}
          className={`hover:text-primary transition-colors ${showTerminal ? "text-primary" : ""}`}
        >
          <Icon name="terminal" size={20} />
        </button>
        <button className="hover:text-primary transition-colors">
          <Icon name="settings" size={20} />
        </button>
        <div className="w-8 h-8 rounded-full border border-white/20 overflow-hidden relative ml-2">
          <div className="absolute inset-0 bg-primary/20 animate-pulse"></div>
          <img 
            className="w-full h-full object-cover mix-blend-screen opacity-80" 
            alt="User Core" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhZViFnNvfW-6qyn1GT-L6iRBGaHdmg8piSKcoijI64YhbKrUJa2z1rIbt5oLbMg0YkSVWdndT9O0feDWoi3zRuiYyG6fg7gF5ZujzAEE0QcrD10kA4iz-74dd89-zC80ffWzk7GoE5T7sOMv0jFYT1QfA4vUgy1CJfP4hzBLy-mEqCS9Xw-fTn_LskPbsIkiNFeh8SmSrBQSGGQ-uApm7BHLRKVXvpN6ZquUNs5TJE_SdF2C8J7xU7Vp-cnjt_d5y8NXqIbgfu0AI"
          />
        </div>
      </div>
    </nav>
  )
}
