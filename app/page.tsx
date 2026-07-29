'use client';
import { useVoiceAssistant } from '@/contexts/voice-assistant-context';

export default function Dashboard() {
  const { isListening, isSpeaking, history, startListening, stopListening } = useVoiceAssistant();

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#FAF8F5] text-[#2D2B27] p-8 gap-8 font-sans">
      {/* Left Column */}
      <div className="flex flex-col gap-8 w-full md:w-1/4">
        <div>
          <h2 className="text-sm font-bold text-[#8C8579] uppercase tracking-wider mb-2">Time</h2>
          <p className="text-3xl font-display">
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
          </p>
          <p className="text-[#8C8579]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="bg-[#F3F0EA] p-6 rounded-2xl border border-[#E8E3D9]">
          <h2 className="text-sm font-bold text-[#8C8579] uppercase tracking-wider mb-4">Daily Digest</h2>
          <p className="text-sm">Your morning digest will appear here.</p>
        </div>
      </div>

      {/* Center Column */}
      <div className="flex flex-col items-center justify-center flex-1 relative">
        <button
          onClick={isListening ? stopListening : startListening}
          className={`w-48 h-48 rounded-full shadow-lg transition-all duration-500 ${
            isListening ? 'bg-[#E8A44A] shadow-[#F5DDB0] animate-pulse scale-110' :
            isSpeaking ? 'bg-[#7EB8A4] shadow-[#bce0d3] animate-pulse scale-105' :
            'bg-[#2D2B27] hover:scale-105 hover:bg-[#1A1917]'
          }`}
        />
        <p className="mt-8 text-[#8C8579] tracking-widest uppercase text-sm">
          {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready'}
        </p>
      </div>

      {/* Right Column */}
      <div className="flex flex-col w-full md:w-1/3 bg-[#F3F0EA] rounded-3xl border border-[#E8E3D9] overflow-hidden">
        <div className="p-6 border-b border-[#E8E3D9]">
          <h2 className="text-sm font-bold text-[#8C8579] uppercase tracking-wider">Conversation</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {history.length === 0 && <p className="text-[#8C8579] text-sm text-center">No conversation history yet.</p>}
          {history.map((msg, idx) => (
            <div key={idx} className={`p-4 rounded-xl max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-[#E8E3D9] self-end rounded-tr-none' 
                : 'bg-white shadow-sm self-start rounded-tl-none'
            }`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
