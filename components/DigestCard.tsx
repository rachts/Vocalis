"use client";

import { useState } from "react";
import { Play, Pause } from "lucide-react";
import { useVoiceAssistant } from "@/contexts/voice-assistant-context";

export function DigestCard() {
  const [isPlaying, setIsPlaying] = useState(false);

  // In a real app we'd fetch the latest digest text and audio URL from Supabase
  const digestText = "Good morning! It's currently 72 degrees and sunny. You have 3 tasks for today, including reviewing pull requests. Your first meeting is at 10 AM.";

  const togglePlay = () => {
    // In a real app we'd play the audio URL
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="w-full max-w-sm bg-[#FDF6EC] border border-[var(--color-glow-soft)] rounded-[20px] p-6 text-[var(--color-charcoal)] relative shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-body uppercase tracking-[1.5px] text-[var(--color-stone)]">
          Morning Digest
        </span>
        <button 
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-[var(--color-ink)] text-white flex items-center justify-center hover:scale-105 transition-transform"
        >
          {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-1" />}
        </button>
      </div>
      
      <p className="font-display text-[15px] leading-[1.7] mb-4">
        {digestText}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex-1 h-1 bg-[var(--color-parchment)] rounded-full overflow-hidden mr-4">
          <div className="h-full bg-[var(--color-glow)] w-1/3 rounded-full" />
        </div>
        <span className="text-[11px] text-[var(--color-stone)] font-body">Updated at 7:30 AM</span>
      </div>
    </div>
  );
}
