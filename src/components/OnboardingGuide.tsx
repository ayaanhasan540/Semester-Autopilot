import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Clock,
  RefreshCw,
  Scale,
  X,
  ChevronRight,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface OnboardingGuideProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUpload: () => void;
  onOpenTriage: () => void;
  onGoToTab: (tab: 'agenda' | 'workload' | 'syllabi' | 'commitments') => void;
  onSimulateSkip: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({
  isOpen,
  onClose,
  onOpenUpload,
  onOpenTriage,
  onGoToTab,
  onSimulateSkip,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to Semester Autopilot',
      subtitle: 'Your syllabi, turned into an adaptive daily study schedule that updates itself.',
      icon: <Sparkles className="w-6 h-6 text-amber-500" />,
      content: (
        <div className="space-y-3 text-xs text-stone-600 leading-relaxed">
          <p>
            Most college planners fail because life gets in the way: you get sick, skip a day, or three exams land on the same Thursday.
          </p>
          <p className="bg-amber-50 border border-amber-200/80 p-3 rounded-xl text-amber-900 font-medium">
            <strong>Semester Autopilot solves this:</strong> It maps every syllabus, locks out your classes & job shifts, tells you what to study today, reshuffles automatically when you miss a session, and calculates what to drop if you're overloaded.
          </p>
        </div>
      ),
      actionLabel: 'Next: How it works (30s)',
      action: () => setCurrentStep(1),
    },
    {
      title: 'Step 1: Your Syllabi & Grade Weights',
      subtitle: 'Never guess how much an assignment actually matters.',
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />,
      content: (
        <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
          <p>
            Upload or paste any syllabus. Autopilot uses AI to extract every single deliverable, its due date, and its <strong>exact percentage of your final grade</strong> (e.g. Midterm 1: 20%, Homework 4: 5%).
          </p>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
            <span className="font-semibold text-stone-900 block">Why this matters:</span>
            <span>
              Spending 15 hours on a 2% assignment while ignoring a 30% exam destroys GPAs. Autopilot weights study hours proportional to grade impact.
            </span>
          </div>
        </div>
      ),
      actionLabel: 'Next: Weekly Commitments',
      action: () => setCurrentStep(2),
    },
    {
      title: 'Step 2: Free Time vs. Fixed Commitments',
      subtitle: 'Study blocks are only scheduled when you are actually free.',
      icon: <Clock className="w-6 h-6 text-blue-600" />,
      content: (
        <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
          <p>
            Add your recurring schedule: lectures, campus job shifts, lab sections, workouts, or club meetings.
          </p>
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
            <span className="font-semibold text-stone-900 block">Smart Free Time Detection:</span>
            <span>
              Autopilot blocks out busy times, adds travel buffers, and only slots study blocks into your genuine open windows (e.g., Monday 14:30 – 17:30).
            </span>
          </div>
        </div>
      ),
      actionLabel: 'Next: The Reshuffle Engine',
      action: () => setCurrentStep(3),
    },
    {
      title: 'Step 3: Miss a Day? Autopilot Reshuffles',
      subtitle: 'Zero guilt. Plans that bend instead of breaking.',
      icon: <RefreshCw className="w-6 h-6 text-purple-600" />,
      content: (
        <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
          <p>
            Had an emergency or too tired to study today? Click <strong>"Skip & Reshuffle"</strong>.
          </p>
          <p>
            Autopilot instantly moves that prep work into your next upcoming free slots without double-booking. If a professor moves an exam date, edit it and the whole semester rebalances.
          </p>
        </div>
      ),
      actionLabel: 'Next: Emergency Grade Triage',
      action: () => setCurrentStep(4),
    },
    {
      title: 'Step 4: Emergency Grade Triage',
      subtitle: 'When you are drowning, know exactly what to drop.',
      icon: <Scale className="w-6 h-6 text-rose-600" />,
      content: (
        <div className="space-y-2 text-xs text-stone-600 leading-relaxed">
          <p>
            If you have 10 hours available for 22 hours of work, cramming everything leads to exhaustion and failure across all classes.
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-950">
            <span className="font-semibold block">The Triage Formula:</span>
            <span>
              Autopilot calculates which small deliverables (like a 2% reading quiz that takes 5 hours) can be safely dropped or trimmed to 80/20 effort to guarantee you ace your 25% midterm.
            </span>
          </div>
        </div>
      ),
      actionLabel: 'Start Exploring (Got it!)',
      action: onClose,
    },
  ];

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative border border-stone-100">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100 transition-colors"
          title="Close guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep
                  ? 'w-8 bg-stone-900'
                  : idx < currentStep
                  ? 'w-3 bg-stone-400'
                  : 'w-3 bg-stone-200'
              }`}
              title={`Go to step ${idx + 1}`}
            />
          ))}
          <span className="text-[11px] text-stone-400 font-mono ml-2">
            {currentStep + 1} of {steps.length}
          </span>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center shrink-0">
              {current.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 tracking-tight">
                {current.title}
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {current.subtitle}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            {current.content}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          {currentStep > 0 ? (
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-3.5 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-stone-400 hover:text-stone-600"
            >
              Skip guide
            </button>
          )}

          <button
            onClick={current.action}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 shadow-sm transition-colors"
          >
            <span>{current.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
