'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { STT } from '@/lib/audio/stt';
import { TTS } from '@/lib/audio/tts';
import { processCommand } from '@/lib/commandHandler';
import { getMemory } from '@/lib/memory';
import type { Message } from '@/types/tools';

interface VoiceContextType {
  isListening: boolean;
  isSpeaking: boolean;
  history: Message[];
  startListening: () => void;
  stopListening: () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export function VoiceAssistantProvider({ children }: { children: ReactNode }) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [history, setHistory] = useState<Message[]>([]);
  const [stt, setStt] = useState<STT | null>(null);
  const [tts, setTts] = useState<TTS | null>(null);
  
  const sessionId = 'default-session';

  useEffect(() => {
    getMemory(sessionId).then(setHistory);
    
    const newTts = new TTS();
    setTts(newTts);
    
    const newStt = new STT(async (text) => {
      setIsListening(false);
      setHistory(prev => [...prev, { role: 'user', content: text }]);
      setIsSpeaking(true);
      
      const currentHistory = await getMemory(sessionId);
      const res = await processCommand({ transcript: text, history: currentHistory, sessionId });
      
      setHistory(prev => [...prev, { role: 'assistant', content: res.response }]);
      
      if (res.action?.type === 'open_url') {
        window.open(res.action.payload, '_blank');
      }
      
      await newTts.speak(res.response);
      setIsSpeaking(false);
    });
    setStt(newStt);

    return () => {
      newStt.stop();
      newTts.stop();
    };
  }, []);

  const startListening = () => {
    if (!stt) return;
    setIsListening(true);
    stt.start();
  };

  const stopListening = () => {
    if (!stt) return;
    setIsListening(false);
    stt.stop();
  };

  return (
    <VoiceContext.Provider value={{ isListening, isSpeaking, history, startListening, stopListening }}>
      {children}
    </VoiceContext.Provider>
  );
}

export const useVoiceAssistant = () => {
  const context = useContext(VoiceContext);
  if (!context) throw new Error('Must be used within VoiceAssistantProvider');
  return context;
};
