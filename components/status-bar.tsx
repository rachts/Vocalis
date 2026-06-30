import { Wifi, WifiOff, Mic, Activity } from "lucide-react"

export function StatusBar({ 
  isOnline, 
  isListening,
  latency = 0 
}: { 
  isOnline: boolean, 
  isListening: boolean,
  latency?: number
}) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-6 px-6 py-2 bg-black/60 border border-white/10 rounded-full backdrop-blur-lg z-50 text-xs font-mono text-white/50 tracking-wider">
      {/* Connection */}
      <div className="flex items-center gap-2">
        {isOnline ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
        <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
      </div>
      
      {/* Mic Status */}
      <div className="flex items-center gap-2">
        <Mic className={`w-3 h-3 ${isListening ? "text-red-500 animate-pulse" : "text-white/30"}`} />
        <span>{isListening ? "LISTENING" : "IDLE"}</span>
      </div>

      {/* Latency */}
      <div className="flex items-center gap-2 hidden md:flex">
        <Activity className="w-3 h-3 text-indigo-400" />
        <span>{latency}MS</span>
      </div>
    </div>
  )
}
