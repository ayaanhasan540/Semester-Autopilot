import React from 'react';
import {
  Calendar,
  Layers,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  Scale,
  PlusCircle,
  Download,
  RotateCcw,
  HelpCircle,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'agenda' | 'workload' | 'syllabi' | 'commitments';
  setActiveTab: (tab: 'agenda' | 'workload' | 'syllabi' | 'commitments') => void;
  onOpenUpload: () => void;
  onOpenTriage: () => void;
  onOpenGuide: () => void;
  onReshuffle: () => void;
  onExport: () => void;
  onResetData: () => void;
  currentDate: string;
  hasCrunch: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenUpload,
  onOpenTriage,
  onOpenGuide,
  onReshuffle,
  onExport,
  onResetData,
  currentDate,
  hasCrunch,
}) => {
  const formattedDate = new Date(currentDate + 'T00:00:00').toLocaleDateString(
    'en-US',
    { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
  );

  return (
    <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-tight text-white text-base">
                  Semester Autopilot
                </span>
                <span className="text-xs text-stone-400 font-normal hidden sm:inline">
                  · Living Study Plan
                </span>
              </div>
              <div className="text-xs text-stone-400 flex items-center gap-1.5">
                <span>{formattedDate}</span>
                {hasCrunch && (
                  <>
                    <span className="text-stone-600">·</span>
                    <span className="text-amber-400 font-medium">Crunch Peak Ahead</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-stone-800/80 p-1 rounded-xl border border-stone-700/60">
            <button
              onClick={() => setActiveTab('agenda')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'agenda'
                  ? 'bg-stone-900 text-white shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Today's Agenda</span>
            </button>
            <button
              onClick={() => setActiveTab('workload')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all relative ${
                activeTab === 'workload'
                  ? 'bg-stone-900 text-white shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Workload & Crunch</span>
              {hasCrunch && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('syllabi')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'syllabi'
                  ? 'bg-stone-900 text-white shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Courses & Syllabi</span>
            </button>
            <button
              onClick={() => setActiveTab('commitments')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === 'commitments'
                  ? 'bg-stone-900 text-white shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Weekly Commitments</span>
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            {/* How it Works / Tour Button */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-800 text-stone-300 border border-stone-700 hover:bg-stone-700 hover:text-white transition-colors"
              title="Learn how Semester Autopilot works"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">How It Works</span>
            </button>

            <button
              onClick={onOpenTriage}
              title="Grade Triage: Decide what to drop based on grade weight when overloaded"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/50 hover:bg-rose-900/40 hover:text-rose-200 transition-colors"
            >
              <Scale className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Grade</span> Triage
            </button>

            <button
              onClick={onReshuffle}
              title="Reshuffle study sessions into upcoming free slots"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-stone-800 text-stone-200 border border-stone-700 hover:bg-stone-700 hover:text-white transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-stone-300" />
              <span className="hidden sm:inline">Reshuffle</span>
            </button>

            <button
              onClick={onOpenUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Upload Syllabus</span>
            </button>

            {/* Overflow controls */}
            <div className="flex items-center border-l border-stone-800 pl-2 ml-1 gap-1">
              <button
                onClick={onExport}
                title="Export semester plan as JSON"
                className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onResetData}
                title="Reset to sample semester data"
                className="p-1.5 text-stone-400 hover:text-stone-200 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-stone-800 text-xs">
          <button
            onClick={() => setActiveTab('agenda')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'agenda' ? 'text-amber-400' : 'text-stone-400'
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setActiveTab('workload')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'workload' ? 'text-amber-400' : 'text-stone-400'
            }`}
          >
            Workload
          </button>
          <button
            onClick={() => setActiveTab('syllabi')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'syllabi' ? 'text-amber-400' : 'text-stone-400'
            }`}
          >
            Syllabi
          </button>
          <button
            onClick={() => setActiveTab('commitments')}
            className={`py-1 px-2 rounded font-medium ${
              activeTab === 'commitments' ? 'text-amber-400' : 'text-stone-400'
            }`}
          >
            Schedule
          </button>
        </div>
      </div>
    </header>
  );
};
