"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { ShieldAlert, Check, X, Clock } from 'lucide-react'

interface PermissionModalProps {
  isOpen: boolean;
  toolName: string;
  args: any;
  onRespond: (granted: boolean, scope: 'ONCE' | 'SESSION') => void;
}

export function PermissionModal({ isOpen, toolName, args, onRespond }: PermissionModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="bg-[#111] border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Danger Strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-red-500" />
          
          <div className="flex items-center gap-3 mb-4 text-red-400">
            <ShieldAlert className="w-6 h-6" />
            <h2 className="text-lg font-bold">Permission Required</h2>
          </div>

          <p className="text-white/80 text-sm mb-4 leading-relaxed">
            VOCALIS OS is attempting to execute a secure action via the <strong>{toolName}</strong> tool.
          </p>

          <div className="bg-black/50 border border-white/5 rounded-lg p-3 mb-6 font-mono text-xs text-white/70 overflow-x-auto">
            <pre>{JSON.stringify(args, null, 2)}</pre>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onRespond(true, 'ONCE')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Check className="w-4 h-4" /> Allow Once
            </button>
            
            <button
              onClick={() => onRespond(true, 'SESSION')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg transition-colors font-medium text-sm"
            >
              <Clock className="w-4 h-4" /> Allow for Session
            </button>

            <button
              onClick={() => onRespond(false, 'ONCE')}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors font-medium text-sm mt-2"
            >
              <X className="w-4 h-4" /> Deny
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
