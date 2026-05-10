"use client"

import { motion } from "framer-motion"

export type OrbState = "idle" | "listening" | "processing" | "speaking"

export function AIOrb({ state }: { state: OrbState }) {
  // Define animation variants based on state
  const variants = {
    idle: {
      scale: 1,
      boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)",
      transition: { repeat: Infinity, duration: 4, ease: "easeInOut" }
    },
    listening: {
      scale: 1.15,
      boxShadow: "0 0 60px rgba(99, 102, 241, 0.8)",
      transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut", repeatType: "reverse" as const }
    },
    processing: {
      scale: [1, 1.05, 1],
      rotate: [0, 180, 360],
      boxShadow: "0 0 40px rgba(168, 85, 247, 0.6)",
      transition: { repeat: Infinity, duration: 2, ease: "linear" }
    },
    speaking: {
      scale: [1.1, 1.3, 1.15, 1.25, 1.1], // Simulating waveform spikes
      boxShadow: "0 0 80px rgba(99, 102, 241, 1)",
      transition: { repeat: Infinity, duration: 0.3, ease: "easeInOut" }
    }
  }

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Background ripple for listening */}
      {state === "listening" && (
        <motion.div
          className="absolute inset-0 rounded-full border border-primary pointer-events-none"
          animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
        />
      )}

      {/* Core Orb */}
      <motion.div
        animate={variants[state]} // Typescript warning is fine here if it complains, but we passed correct variants
        className="w-32 h-32 rounded-full bg-black border border-indigo-500 flex items-center justify-center relative overflow-hidden shadow-[0_0_40px_#6366F1]"
      >
         {/* Inner glowing pulse (subtle) */}
         <div className="absolute inset-0 bg-indigo-500/10 blur-xl rounded-full pointer-events-none" />
         
         <motion.img
           src="/logo.png"
           alt="Vocalis"
           initial={{ opacity: 1 }}
           animate={{ opacity: state === "speaking" ? 0.2 : 1 }}
           transition={{ duration: 0.3 }}
           className="w-16 h-16 object-contain relative z-0"
         />

         {/* Waveform indicator if speaking */}
         {state === "speaking" && (
           <div className="absolute inset-0 flex gap-1 items-center justify-center z-10">
             {[1, 2, 3, 4, 5].map((i) => (
               <motion.div
                 key={i}
                 className="w-1.5 bg-white rounded-full h-4"
                 animate={{ height: ["20%", "80%", "20%"] }}
                 transition={{
                   repeat: Infinity,
                   duration: Math.random() * 0.3 + 0.2, // Random duration for varied spikes
                   ease: "easeInOut",
                 }}
               />
             ))}
           </div>
         )}
      </motion.div>
    </div>
  )
}
