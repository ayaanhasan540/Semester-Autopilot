import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { StudySession, Milestone, Course } from '../types';

interface FocusTimerModalProps {
  session: StudySession | null;
  milestone?: Milestone;
  course?: Course;
  onClose: () => void;
  onCompleteSession: (sessionId: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  session,
  milestone,
  course,
  onClose,
  onCompleteSession,
}) => {
  if (!session) return null;

  const initialMinutes = session.durationMinutes || 45;
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialMinutes * 60);
  const [isActive, setIsActive] = useState<boolean>(true);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((sec) => sec - 1);
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const timeFormatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  const progress = Math.min(
    100,
    Math.round(((initialMinutes * 60 - secondsRemaining) / (initialMinutes * 60)) * 100)
  );

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-3xl max-w-md w-full p-8 shadow-2xl text-center space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-200 p-1 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Course & Goal Context */}
        <div className="space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
            <span className="font-bold text-amber-400">{course?.code || 'Course'}</span>
            <span>·</span>
            <span>{milestone?.weightPercent || 5}% of semester grade</span>
          </div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            {session.title}
          </h2>
          <p className="text-xs text-stone-400 max-w-xs mx-auto">
            {session.startTime} – {session.endTime} ({session.durationMinutes} minutes focused study block)
          </p>
        </div>

        {/* Large Timer Display */}
        <div className="py-4">
          <div className="text-6xl font-mono font-bold tracking-tighter text-white tabular-nums">
            {timeFormatted}
          </div>

          {/* Progress Bar */}
          <div className="w-48 bg-stone-800 h-1.5 rounded-full mx-auto mt-4 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setSecondsRemaining(initialMinutes * 60)}
            className="p-2.5 text-stone-400 hover:text-white rounded-xl bg-stone-800 hover:bg-stone-700 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-stone-950 font-bold hover:bg-stone-200 transition-colors shadow-lg"
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4 fill-stone-950" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-stone-950" />
                <span>Resume</span>
              </>
            )}
          </button>
        </div>

        {/* Complete Session Action */}
        <div className="pt-4 border-t border-stone-800">
          <button
            onClick={() => {
              onCompleteSession(session.id);
              onClose();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors text-xs font-semibold"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Session Complete & Record Hours</span>
          </button>
        </div>
      </div>
    </div>
  );
};
