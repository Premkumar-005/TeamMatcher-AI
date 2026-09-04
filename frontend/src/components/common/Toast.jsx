import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          let icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
          let borderClass = 'border-emerald-500/30';

          if (toast.type === 'error') {
            icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            borderClass = 'border-rose-500/30';
          } else if (toast.type === 'info') {
            icon = <Info className="w-4 h-4 text-indigo-400 shrink-0" />;
            borderClass = 'border-indigo-500/30';
          }

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`pointer-events-auto p-3.5 rounded-xl border ${borderClass} bg-[#0E0E10]/95 backdrop-blur-md shadow-2xl flex items-start justify-between gap-3`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="mt-0.5">{icon}</div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-white truncate">{toast.title}</h4>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5 leading-relaxed">{toast.message}</p>
                </div>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-[#71717A] hover:text-white p-0.5 rounded transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

