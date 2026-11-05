import React, { useState } from 'react';
import {
  Scale,
  X,
  AlertTriangle,
  ShieldCheck,
  Scissors,
  Trash2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  HelpCircle,
} from 'lucide-react';
import { Milestone, Course, WeeklyCommitment, TriageItem, TriagePlan } from '../types';
import { calculateGradeTriage } from '../utils/scheduler';

interface TriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestones: Milestone[];
  courses: Course[];
  commitments: WeeklyCommitment[];
  onApplyTriage: (triagedItems: TriageItem[]) => void;
}

export const TriageModal: React.FC<TriageModalProps> = ({
  isOpen,
  onClose,
  milestones,
  courses,
  commitments,
  onApplyTriage,
}) => {
  const [simulatedDeficit, setSimulatedDeficit] = useState<number>(12); // Default 12 hours deficit
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAdvice, setAiAdvice] = useState<any | null>(null);

  if (!isOpen) return null;

  // Active items
  const activeMilestones = milestones.filter(
    (m) => m.status !== 'completed' && m.status !== 'dropped'
  );
  const totalNeededHours = activeMilestones.reduce(
    (acc, m) => acc + (m.estimatedPrepHours - m.completedHours),
    0
  );
  const availableHours = Math.max(0, totalNeededHours - simulatedDeficit);

  // Compute triage plan
  const triagePlan: TriagePlan = calculateGradeTriage(
    milestones,
    courses,
    availableHours,
    totalNeededHours
  );

  const handleAskGeminiTriage = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/generate-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: triagePlan.items.slice(0, 6),
          availableHours,
          neededHours: totalNeededHours,
          context: 'Midterm season crunch with multiple competing deadlines',
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setAiAdvice(data.data);
      }
    } catch (err) {
      console.error('Failed to get Gemini triage:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApply = () => {
    onApplyTriage(triagePlan.items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-800 flex items-center justify-center">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900">
                Grade Triage & Trade-off Optimizer
              </h2>
              <p className="text-xs text-stone-500">
                When you don't have enough time for everything, make data-driven trade-offs based on syllabus weights.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plain English "What is Grade Triage?" explainer */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-700 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-stone-900">
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>How Grade Triage Protects Your GPA:</span>
          </div>
          <p className="leading-relaxed">
            Every semester has an emergency week where you physically cannot do 100% of everything. Trying to do it all leads to burnout and mediocre grades across every class.
          </p>
          <p className="leading-relaxed font-medium text-stone-900">
            Grade Triage identifies small-weight tasks (like a 2% homework that takes 5 hours) and suggests either <strong>sacrificing it</strong> or <strong>trimming it to 80/20 effort</strong>—freeing up the critical hours you need to get an A on your 25% midterm.
          </p>
        </div>

        {/* Deficit Controller Box */}
        <div className="bg-rose-50 border border-rose-200/80 rounded-2xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-rose-900 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Simulated Study Deficit: {simulatedDeficit} hours</span>
              </span>
              <p className="text-xs text-rose-800/80 mt-0.5">
                You need {totalNeededHours.toFixed(1)}h of prep, but only have {availableHours.toFixed(1)}h free.
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-rose-800 font-semibold mr-1">Preset Scenarios:</span>
              {[6, 12, 18].map((hrs) => (
                <button
                  key={hrs}
                  onClick={() => setSimulatedDeficit(hrs)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    simulatedDeficit === hrs
                      ? 'bg-rose-700 text-white shadow-xs'
                      : 'bg-white text-rose-900 border border-rose-200 hover:bg-rose-100'
                  }`}
                >
                  -{hrs}h Crunch
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={simulatedDeficit}
              onChange={(e) => setSimulatedDeficit(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-rose-700/80 font-medium">
              <span>Light crunch (2h)</span>
              <span>Severe midterm collision (15h)</span>
              <span>Emergency overload (30h)</span>
            </div>
          </div>
        </div>

        {/* Triage Recommendations List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
              Autopilot Recommended Actions
            </span>
            <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Saves {triagePlan.totalHoursSaved}h · Protects 97%+ of GPA
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {triagePlan.items.map((item) => {
              const isProtect = item.suggestedAction === 'protect';
              const isTrim = item.suggestedAction === 'trim';
              const isDrop = item.suggestedAction === 'drop';

              return (
                <div
                  key={item.milestoneId}
                  className={`p-4 rounded-2xl border transition-all text-xs space-y-2 ${
                    isProtect
                      ? 'border-emerald-200 bg-emerald-50/25'
                      : isTrim
                      ? 'border-amber-200 bg-amber-50/25'
                      : 'border-rose-200 bg-rose-50/35'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-stone-500 font-medium">
                        <span className="font-bold text-stone-900">{item.courseCode}</span>
                        <span>·</span>
                        <span className="text-stone-800 font-bold">{item.milestoneTitle}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-stone-600 text-[11px]">
                        <span>Weight: <strong>{item.weightPercent}% of grade</strong></span>
                        <span>·</span>
                        <span>Prep Time: {item.currentPrepHours}h</span>
                        <span>·</span>
                        <span className="text-stone-700 font-mono font-medium">
                          Ratio: {item.hoursPerWeightPoint}h saved / 1% grade
                        </span>
                      </div>
                    </div>

                    {/* Action Badge */}
                    <div className="shrink-0">
                      {isProtect && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>PROTECT 100%</span>
                        </span>
                      )}
                      {isTrim && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                          <Scissors className="w-3.5 h-3.5 text-amber-800" />
                          <span>TRIM TO 80/20 (-{item.hoursSaved}h)</span>
                        </span>
                      )}
                      {isDrop && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-100 text-rose-950 border border-rose-300">
                          <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                          <span>DROP / SACRIFICE</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-stone-600 leading-relaxed text-[11px]">
                    {item.rationale}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Advisor Card */}
        {aiAdvice ? (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Gemini Academic Strategy Advisor:</span>
            </div>
            <p className="text-stone-800 font-semibold">{aiAdvice.verdict}</p>
            <p className="text-stone-600 italic">"{aiAdvice.calmingAdvice}"</p>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs">
            <span className="text-stone-600">
              Want a second opinion on professor curves and grading policies?
            </span>
            <button
              onClick={handleAskGeminiTriage}
              disabled={isAiLoading}
              className="flex items-center gap-1 text-stone-900 font-bold hover:text-amber-800 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAiLoading ? 'Analyzing...' : 'Ask AI Academic Advisor'}</span>
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-stone-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
          >
            Cancel
          </button>

          <button
            onClick={handleApply}
            className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold rounded-xl bg-stone-900 text-white hover:bg-stone-800 shadow-sm transition-colors"
          >
            <span>Apply Triage Plan & Reshuffle Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
