import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  RotateCw,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BookOpen,
  CalendarDays,
  HelpCircle,
  Scale,
  Zap,
} from 'lucide-react';
import { StudySession, Milestone, Course, WeeklyCommitment } from '../types';
import { getFreeTimeSlotsForDay, minutesToTime, addDays } from '../utils/scheduler';

interface TodayAgendaProps {
  currentDate: string;
  onSetCurrentDate: (newDate: string) => void;
  sessions: StudySession[];
  milestones: Milestone[];
  courses: Course[];
  commitments: WeeklyCommitment[];
  onToggleSessionComplete: (sessionId: string) => void;
  onSkipSession: (sessionId: string) => void;
  onStartFocus: (session: StudySession) => void;
  onMoveMilestoneDate: (milestoneId: string, newDate: string) => void;
  onTriggerReshuffle: (reason?: string) => void;
  onOpenTriage?: () => void;
  onOpenGuide?: () => void;
}

export const TodayAgenda: React.FC<TodayAgendaProps> = ({
  currentDate,
  onSetCurrentDate,
  sessions,
  milestones,
  courses,
  commitments,
  onToggleSessionComplete,
  onSkipSession,
  onStartFocus,
  onMoveMilestoneDate,
  onTriggerReshuffle,
  onOpenTriage,
  onOpenGuide,
}) => {
  const [selectedMilestoneToMove, setSelectedMilestoneToMove] = useState<string>('');
  const [newDateInput, setNewDateInput] = useState<string>('');
  const [showMoveDateBox, setShowMoveDateBox] = useState<boolean>(false);
  const [dismissExplanation, setDismissExplanation] = useState<boolean>(false);

  // Map courses
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  // Today's sessions
  const todaySessions = sessions.filter((s) => s.date === currentDate);
  const completedTodayCount = todaySessions.filter((s) => s.completed).length;
  const totalPlannedMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const completedMinutes = todaySessions
    .filter((s) => s.completed)
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Find nearest upcoming high-stakes milestone (exam or project >= 15% weight)
  const nextMajorMilestone = milestones
    .filter((m) => {
      const d = m.dueDate.split('T')[0];
      return d >= currentDate && m.weightPercent >= 15 && m.status !== 'completed';
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  // Calculate days until next major
  let daysUntilMajor = 0;
  if (nextMajorMilestone) {
    const todayMs = new Date(currentDate + 'T00:00:00').getTime();
    const targetMs = new Date(nextMajorMilestone.dueDate.split('T')[0] + 'T00:00:00').getTime();
    daysUntilMajor = Math.max(0, Math.round((targetMs - todayMs) / (1000 * 60 * 60 * 24)));
  }

  // Today's commitments (classes, work)
  const dateObj = new Date(currentDate + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  const todayCommitments = commitments
    .filter((c) => c.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Today's free slots
  const freeSlots = getFreeTimeSlotsForDay(currentDate, commitments);

  const formattedDateTitle = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const isToday = currentDate === '2026-11-05';

  return (
    <div className="space-y-6">
      {/* Date Header & Quick Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Daily Autopilot Agenda</span>
            <span aria-hidden="true">·</span>
            <span>{isToday ? 'Today' : 'Simulated Date'}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-0.5">
            {formattedDateTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg bg-white border border-stone-200 p-0.5 shadow-xs">
            <button
              onClick={() => onSetCurrentDate(addDays(currentDate, -1))}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-50 transition-colors"
              title="View Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSetCurrentDate('2026-11-05')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                isToday
                  ? 'bg-stone-900 text-white'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => onSetCurrentDate(addDays(currentDate, 1))}
              className="p-1.5 text-stone-600 hover:text-stone-900 rounded-md hover:bg-stone-50 transition-colors"
              title="View Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <input
              type="date"
              value={currentDate}
              onChange={(e) => e.target.value && onSetCurrentDate(e.target.value)}
              className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              title="Jump to specific date"
            />
          </div>
        </div>
      </div>

      {/* Friendly New User "How Autopilot Works" Bar */}
      {!dismissExplanation && (
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3 relative">
          <button
            onClick={() => setDismissExplanation(true)}
            className="absolute top-4 right-4 text-stone-400 hover:text-white text-xs font-medium"
            title="Dismiss explanation"
          >
            ✕ Dismiss
          </button>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="space-y-1 pr-14">
              <h2 className="text-sm font-semibold text-white">
                How Autopilot Created Today's Plan For You
              </h2>
              <p className="text-xs text-stone-300 leading-relaxed">
                Autopilot took every syllabus, extracted all upcoming exams and assignments, blocked out your fixed classes and work shifts, and automatically scheduled <strong>{(totalPlannedMinutes / 60).toFixed(1)} hours of study</strong> into your open free windows today.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-800 text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              <span className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] text-amber-400 font-bold shrink-0">1</span>
              <span><strong>Due Date Pacing:</strong> Study blocks end before deadlines.</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <span className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] text-amber-400 font-bold shrink-0">2</span>
              <span><strong>Grade Weighted:</strong> Big exams get prioritized hours.</span>
            </div>
            <div className="flex items-center gap-2 text-stone-300">
              <span className="w-5 h-5 rounded-full bg-stone-800 flex items-center justify-center text-[10px] text-amber-400 font-bold shrink-0">3</span>
              <span><strong>Auto-Reshuffle:</strong> Miss a day? It relocates uncompleted blocks.</span>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Simulator / Try It Out Bar for New Users */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-amber-950 font-medium">
          <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>New here?</strong> Try one of these 1-click test actions to see Autopilot adapt in real time:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {todaySessions.length > 0 && (
            <button
              onClick={() => onSkipSession(todaySessions[0].id)}
              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 hover:bg-amber-100 font-medium shadow-xs transition-colors"
              title="See how Autopilot shifts today's work to tomorrow"
            >
              🧪 Simulate: Missed a study session
            </button>
          )}

          <button
            onClick={() => {
              if (nextMajorMilestone) {
                setSelectedMilestoneToMove(nextMajorMilestone.id);
                setNewDateInput(addDays(nextMajorMilestone.dueDate.split('T')[0], 4));
                setShowMoveDateBox(true);
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 hover:bg-amber-100 font-medium shadow-xs transition-colors"
            title="Simulate professor delaying an exam"
          >
            📅 Simulate: Professor delayed exam
          </button>

          {onOpenTriage && (
            <button
              onClick={onOpenTriage}
              className="px-2.5 py-1 rounded-lg bg-rose-100 border border-rose-300 text-rose-950 hover:bg-rose-200 font-medium shadow-xs transition-colors"
              title="See how Autopilot helps you drop low-weight work when overloaded"
            >
              ⚖️ Simulate: Schedule crisis (Grade Triage)
            </button>
          )}
        </div>
      </div>

      {/* Top Banner: Next Major Milestone countdown */}
      {nextMajorMilestone && (
        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span className="text-amber-800 font-bold">Upcoming Major Deliverable</span>
                <span>·</span>
                <span className="font-semibold text-stone-900">{daysUntilMajor === 0 ? 'Due Today!' : `in ${daysUntilMajor} days`}</span>
                <span>·</span>
                <span className="text-rose-700 font-semibold">{nextMajorMilestone.weightPercent}% of your course grade</span>
              </div>
              <h2 className="text-base font-bold text-stone-900 mt-0.5">
                {courseMap.get(nextMajorMilestone.courseId)?.code}: {nextMajorMilestone.title}
              </h2>
              <p className="text-xs text-stone-600 mt-0.5">
                Autopilot is distributing <strong>{nextMajorMilestone.estimatedPrepHours} total hours of prep</strong> across your open calendar slots so you never have to pull an all-nighter.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setSelectedMilestoneToMove(nextMajorMilestone.id);
              setNewDateInput(nextMajorMilestone.dueDate.split('T')[0]);
              setShowMoveDateBox(true);
            }}
            className="self-start md:self-center px-3.5 py-2 text-xs font-medium rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <CalendarDays className="w-3.5 h-3.5 text-stone-600" />
            <span>Professor moved date?</span>
          </button>
        </div>
      )}

      {/* Interactive Quick Date Move Modal/Flyout */}
      {showMoveDateBox && (
        <div className="bg-white border-2 border-amber-400 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4 text-amber-600" />
              <span>Simulate Professor Date Change</span>
            </span>
            <button
              onClick={() => setShowMoveDateBox(false)}
              className="text-stone-400 hover:text-stone-600 text-xs font-medium"
            >
              Cancel
            </button>
          </div>
          <p className="text-xs text-stone-600">
            If a professor delays an exam or moves a homework due date, select the deliverable and choose the new date. Autopilot will automatically recalculate and reshuffle your study blocks without double-booking.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Select Deliverable
              </label>
              <select
                value={selectedMilestoneToMove}
                onChange={(e) => {
                  setSelectedMilestoneToMove(e.target.value);
                  const found = milestones.find((m) => m.id === e.target.value);
                  if (found) setNewDateInput(found.dueDate.split('T')[0]);
                }}
                className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2.5 text-stone-800 font-medium"
              >
                {milestones.map((m) => (
                  <option key={m.id} value={m.id}>
                    {courseMap.get(m.courseId)?.code} - {m.title} (Currently: {m.dueDate.split('T')[0]})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                New Due Date
              </label>
              <input
                type="date"
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
                className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2.5 text-stone-800 font-medium"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowMoveDateBox(false)}
              className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900"
            >
              Close
            </button>
            <button
              onClick={() => {
                if (selectedMilestoneToMove && newDateInput) {
                  onMoveMilestoneDate(selectedMilestoneToMove, newDateInput);
                  setShowMoveDateBox(false);
                }
              }}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-stone-900 text-white hover:bg-stone-800 shadow-sm"
            >
              Update Due Date & Reshuffle Plan
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Agenda & Commitments Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Today's Study Sessions (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900">
                What To Work On Today
              </h2>
              <p className="text-xs text-stone-500">
                {completedTodayCount} of {todaySessions.length} sessions completed · {(totalPlannedMinutes / 60).toFixed(1)}h total planned
              </p>
            </div>

            {todaySessions.length > 0 && (
              <button
                onClick={() => onTriggerReshuffle('Manual reshuffle requested for today')}
                className="text-xs text-stone-600 hover:text-stone-900 flex items-center gap-1 font-semibold p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                title="Recalculate and re-slot remaining sessions"
              >
                <RotateCw className="w-3.5 h-3.5 text-stone-500" />
                <span>Reshuffle Plan</span>
              </button>
            )}
          </div>

          {todaySessions.length === 0 ? (
            <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-stone-900">
                No study sessions scheduled for this day
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Autopilot detected no urgent prep required today, or you've completed all scheduled blocks. Enjoy your free time or preview tomorrow's study agenda below.
              </p>
              <button
                onClick={() => onSetCurrentDate(addDays(currentDate, 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors shadow-xs"
              >
                <span>View Tomorrow's Plan</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session, index) => {
                const course = courseMap.get(session.courseId);
                const milestone = milestones.find((m) => m.id === session.milestoneId);

                return (
                  <div
                    key={session.id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all ${
                      session.completed
                        ? 'border-emerald-200 bg-emerald-50/20 opacity-75'
                        : 'border-stone-200 shadow-xs hover:border-stone-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3.5">
                        {/* Checkbox */}
                        <button
                          onClick={() => onToggleSessionComplete(session.id)}
                          className="mt-1 text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                          title={session.completed ? 'Mark uncompleted' : 'Mark completed'}
                        >
                          {session.completed ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-stone-300 hover:text-emerald-500" />
                          )}
                        </button>

                        <div className="space-y-1">
                          {/* Course & Metadata */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
                            <span className="font-bold text-stone-900">
                              {course?.code || 'Course'}
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                              {session.startTime} – {session.endTime} ({(session.durationMinutes / 60).toFixed(1)}h)
                            </span>
                            {milestone && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-rose-700 font-semibold">
                                  {milestone.weightPercent}% course grade
                                </span>
                              </>
                            )}
                          </div>

                          {/* Session Title */}
                          <h3
                            className={`text-base font-semibold ${
                              session.completed ? 'line-through text-stone-400' : 'text-stone-900'
                            }`}
                          >
                            {session.title}
                          </h3>

                          {/* Target Milestone context */}
                          {milestone && (
                            <div className="text-xs text-stone-500 flex flex-wrap items-center gap-1.5 pt-0.5">
                              <span>Milestone:</span>
                              <span className="text-stone-700 font-medium">{milestone.title}</span>
                              <span aria-hidden="true">·</span>
                              <span>Due {milestone.dueDate.split('T')[0]}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {!session.completed && (
                        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pt-2 sm:pt-0">
                          <button
                            onClick={() => onStartFocus(session)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-900 text-white hover:bg-stone-800 shadow-xs transition-colors"
                            title="Open distraction-free focus timer"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Start Timer</span>
                          </button>

                          <button
                            onClick={() => onSkipSession(session.id)}
                            title="Can't study this block today? Autopilot will automatically find your next free window and reschedule it."
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                          >
                            <RotateCw className="w-3 h-3 text-stone-500" />
                            <span>Can't do today (Reshuffle)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Daily Progress Bar */}
          {todaySessions.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-stone-800">Today's Study Progress</span>
                <span className="text-stone-600 font-medium">
                  {completedMinutes} mins done of {totalPlannedMinutes} mins total (
                  {totalPlannedMinutes > 0 ? Math.round((completedMinutes / totalPlannedMinutes) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      totalPlannedMinutes > 0
                        ? Math.min(100, (completedMinutes / totalPlannedMinutes) * 100)
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Today's Commitments & Open Free Slots (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4 shadow-xs">
            <div>
              <h2 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-stone-600" />
                <span>Fixed Commitments Today</span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">
                Lectures, work shifts, and activities blocking your calendar today. Autopilot will not schedule study sessions during these times.
              </p>
            </div>

            {todayCommitments.length === 0 ? (
              <div className="text-xs text-stone-500 italic py-2">
                No fixed commitments today! Full open day for uninterrupted deep focus.
              </div>
            ) : (
              <div className="space-y-2">
                {todayCommitments.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-stone-800 block">{c.title}</span>
                      <span className="text-stone-500 capitalize text-[11px]">
                        {c.category}
                      </span>
                    </div>
                    <span className="text-stone-700 font-mono text-[11px] font-semibold bg-white px-2 py-0.5 rounded border border-stone-200">
                      {c.startTime} – {c.endTime}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Free Windows for Study */}
            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div>
                <span className="text-xs font-bold text-stone-900 block">
                  Identified Free Study Windows
                </span>
                <span className="text-[11px] text-stone-500">
                  Autopilot detected these open slots between your classes:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {freeSlots.map((slot, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg font-mono font-medium"
                  >
                    {minutesToTime(slot.start)} – {minutesToTime(slot.end)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Autopilot Reshuffle Guarantee Note */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-xs text-stone-600 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-stone-900">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Autopilot Reshuffle Guarantee</span>
            </div>
            <p className="leading-relaxed">
              If life happens—an unexpected doctor's appointment, an emergency shift, or just mental fatigue—never feel guilty. Click <strong>"Can't do today (Reshuffle)"</strong> and your study plan will rebalance instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
