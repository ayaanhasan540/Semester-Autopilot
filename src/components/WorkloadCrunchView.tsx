import React, { useState } from 'react';
import {
  Layers,
  AlertTriangle,
  CheckCircle,
  Calendar,
  ChevronRight,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { Milestone, Course, WeeklyCommitment, WeekWorkload } from '../types';
import { calculateSemesterWorkload } from '../utils/scheduler';

interface WorkloadCrunchViewProps {
  milestones: Milestone[];
  courses: Course[];
  commitments: WeeklyCommitment[];
  onOpenTriage: () => void;
  onFrontloadWeek: (weekNumber: number) => void;
}

export const WorkloadCrunchView: React.FC<WorkloadCrunchViewProps> = ({
  milestones,
  courses,
  commitments,
  onOpenTriage,
  onFrontloadWeek,
}) => {
  const workloads = calculateSemesterWorkload(milestones, commitments);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(3); // Default to Week 11 (the big midterm week)

  const courseMap = new Map(courses.map((c) => [c.id, c]));

  // Find critical crunch weeks
  const crunchWeeks = workloads.filter((w) => w.riskLevel === 'critical');
  const selectedWeek = workloads.find((w) => w.weekNumber === selectedWeekNumber) || workloads[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Workload Radar</span>
            <span aria-hidden="true">·</span>
            <span>Semester Stress Timeline</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-0.5">
            Week-by-Week Workload & Early Crunch Warnings
          </h1>
        </div>

        {crunchWeeks.length > 0 && (
          <button
            onClick={onOpenTriage}
            className="self-start sm:self-center flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition-colors shadow-xs"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Open Grade Triage Optimizer</span>
          </button>
        )}
      </div>

      {/* What is this view? User-friendly explanation card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900">
              How the Early Warning System Works
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              Instead of being blindsided when 3 exams hit in the same week, Autopilot tracks your entire semester workload. Whenever required prep exceeds your weekly free hours, it warns you <strong>1 to 2 weeks in advance</strong> so you can study early and stay rested.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-stone-100 text-xs">
          <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
            <div>
              <span className="font-bold text-stone-900 block">Balanced Week</span>
              <span className="text-[11px] text-stone-500">&lt;70% capacity. Safe & steady pacing.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
            <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
            <div>
              <span className="font-bold text-stone-900 block">Elevated Workload</span>
              <span className="text-[11px] text-stone-500">70–95% capacity. Start prep 5 days early.</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-stone-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200/80">
            <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
            <div>
              <span className="font-bold text-rose-950 block">Critical Crunch Week!</span>
              <span className="text-[11px] text-rose-800">Multiple exams collision. Danger of cramming.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Early Crunch Warnings Callout Banner */}
      {crunchWeeks.length > 0 && (
        <div className="bg-rose-500/10 border-2 border-rose-300 rounded-2xl p-5 space-y-3">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-800 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-700" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-900 tracking-wide uppercase">
                  Advance Warning: Severe Exam Collision Detected
                </span>
                <span className="text-xs text-rose-800 font-semibold">
                  (Week {crunchWeeks[0].weekNumber + 8})
                </span>
              </div>
              <p className="text-sm font-bold text-stone-900">
                {crunchWeeks[0].crunchReason}
              </p>
              <p className="text-xs text-stone-700 leading-relaxed">
                {crunchWeeks[0].advanceAdvice}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-rose-200 text-xs">
            <span className="text-stone-600">
              Click below to automatically redistribute Week {crunchWeeks[0].weekNumber + 8} study sessions into earlier free slots.
            </span>
            <button
              onClick={() => onFrontloadWeek(crunchWeeks[0].weekNumber)}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl font-bold hover:bg-stone-800 transition-colors shadow-xs shrink-0"
            >
              Smooth Out This Crunch Week
            </button>
          </div>
        </div>
      )}

      {/* Week by Week Visual Heatmap / Bars */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Full Semester Timeline (Click any week to inspect)
          </span>
          <span className="text-xs text-stone-500">
            Selected: Week {selectedWeek.weekNumber + 8}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {workloads.map((w) => {
            const isSelected = w.weekNumber === selectedWeekNumber;
            const capacityRatio = w.totalPrepHoursNeeded / Math.max(1, w.freeHoursAvailable);
            const isCrunch = w.riskLevel === 'critical';
            const isModerate = w.riskLevel === 'moderate';

            return (
              <button
                key={w.weekNumber}
                onClick={() => setSelectedWeekNumber(w.weekNumber)}
                className={`flex flex-col text-left p-3.5 rounded-2xl border transition-all relative ${
                  isSelected
                    ? 'border-stone-900 bg-white ring-2 ring-stone-900/10 shadow-sm'
                    : isCrunch
                    ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50'
                    : isModerate
                    ? 'border-amber-300 bg-amber-50/40 hover:bg-amber-50'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                {/* Risk Tag */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-stone-900">
                    Week {w.weekNumber + 8}
                  </span>
                  {isCrunch ? (
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                      CRUNCH
                    </span>
                  ) : isModerate ? (
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                      BUSY
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Balanced" />
                  )}
                </div>

                <div className="text-[11px] text-stone-500 mb-2">
                  {w.startDate.slice(5)} – {w.endDate.slice(5)}
                </div>

                {/* Hours comparison */}
                <div className="mt-auto space-y-1 pt-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-bold text-stone-900">
                      {w.totalPrepHoursNeeded}h
                    </span>
                    <span className="text-stone-400 text-[11px]">
                      /{w.freeHoursAvailable}h free
                    </span>
                  </div>

                  {/* Capacity bar */}
                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCrunch
                          ? 'bg-rose-500'
                          : isModerate
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round(capacityRatio * 100))}%`,
                      }}
                    />
                  </div>

                  {/* Grade weight at stake */}
                  <div className="text-[11px] text-stone-600 pt-1 flex items-center justify-between">
                    <span>Grade stake:</span>
                    <span className="font-bold text-stone-900">{w.totalGradeWeightDue}%</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Week Deep-Dive Card */}
      {selectedWeek && (
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span>Detailed Week Inspection</span>
                <span>·</span>
                <span>{selectedWeek.startDate} to {selectedWeek.endDate}</span>
              </div>
              <h2 className="text-lg font-bold text-stone-900 mt-0.5">
                Week {selectedWeek.weekNumber + 8} Deliverables & Grade Stakes
              </h2>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="text-right">
                <span className="text-stone-500 block">Total Prep Needed</span>
                <span className="text-sm font-bold text-stone-900">
                  {selectedWeek.totalPrepHoursNeeded} hours
                </span>
              </div>
              <div className="text-right border-l border-stone-200 pl-4">
                <span className="text-stone-500 block">Grade Weight Due</span>
                <span className="text-sm font-bold text-rose-700">
                  {selectedWeek.totalGradeWeightDue}%
                </span>
              </div>
            </div>
          </div>

          {selectedWeek.milestonesDue.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-500 italic">
              No final deliverables due this week. Perfect time to frontload preparation for upcoming major exam weeks.
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
                Deliverables Due in This Window ({selectedWeek.milestonesDue.length} total)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedWeek.milestonesDue.map((m) => {
                  const course = courseMap.get(m.courseId);
                  const isHighStakes = m.weightPercent >= 15;

                  return (
                    <div
                      key={m.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isHighStakes
                          ? 'border-amber-300 bg-amber-50/25'
                          : 'border-stone-200 bg-stone-50/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-stone-500">
                            <span className="font-bold text-stone-900">
                              {course?.code || 'Course'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="capitalize font-medium">{m.type}</span>
                            <span aria-hidden="true">·</span>
                            <span>Due {m.dueDate.split('T')[0]}</span>
                          </div>
                          <h3 className="text-sm font-bold text-stone-900 mt-1">
                            {m.title}
                          </h3>
                        </div>

                        <span className="text-xs font-bold bg-white border border-stone-200 px-2 py-0.5 rounded-md text-rose-800 shrink-0">
                          {m.weightPercent}% of grade
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 mt-2 line-clamp-2 leading-relaxed">
                        {m.description || 'Deliverable description'}
                      </p>

                      <div className="flex items-center justify-between text-xs text-stone-500 mt-3 pt-2 border-t border-stone-200/60 font-medium">
                        <span>Required Prep: <strong>{m.estimatedPrepHours}h</strong></span>
                        <span className="capitalize">{m.difficulty} priority</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Autopilot Pacing Strategy */}
          {selectedWeek.riskLevel === 'critical' && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-950 space-y-1.5">
              <span className="font-bold block">Autopilot Anti-Cramming Recommendation:</span>
              <p className="leading-relaxed">
                Because this week contains {selectedWeek.milestonesDue.length} simultaneous deadlines totaling {selectedWeek.totalGradeWeightDue}% of your semester, do not wait until this week starts. Autopilot has already scheduled early study sessions starting up to 10 days in advance across your preceding free windows.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
