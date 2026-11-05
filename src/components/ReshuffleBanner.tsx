import React from 'react';
import { RefreshCw, CheckCircle, X } from 'lucide-react';

interface ReshuffleBannerProps {
  message: string | null;
  onDismiss: () => void;
}

export const ReshuffleBanner: React.FC<ReshuffleBannerProps> = ({
  message,
  onDismiss,
}) => {
  if (!message) return null;

  return (
    <aside aria-label="Schedule update notification" className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-stone-900 border border-stone-800 text-stone-100 p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <RefreshCw className="w-4 h-4 animate-spin-reverse" />
        </div>
        <div>
          <span className="text-xs font-semibold text-white block">
            Autopilot Plan Reshuffled
          </span>
          <p className="text-xs text-stone-300 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="text-stone-400 hover:text-stone-200 p-1 rounded-md shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};
