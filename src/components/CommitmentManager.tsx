import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Calendar,
  Briefcase,
  BookOpen,
  Dumbbell,
  Users,
  Sparkles,
  Info,
} from 'lucide-react';
import { WeeklyCommitment, CommitmentCategory } from '../types';
import { getFreeTimeSlotsForDay, minutesToTime, timeToMinutes } from '../utils/scheduler';

interface CommitmentManagerProps {
  commitments: WeeklyCommitment[];
  onAddCommitment: (commitment: Omit<WeeklyCommitment, 'id'>) => void;
  onDeleteCommitment: (id: string) => void;
  onTriggerReshuffle: (reason?: string) => void;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const CommitmentManager: React.FC<CommitmentManagerProps> = ({
  commitments,
  onAddCommitment,
  onDeleteCommitment,
  onTriggerReshuffle,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CommitmentCategory>('class');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');

  // Calculate total weekly free study hours
  let totalFreeMinutes = 0;
  for (let day = 0; day < 7; day++) {
    const sampleDate = `2026-11-0${day + 1}`;
    const slots = getFreeTimeSlotsForDay(sampleDate, commitments);
    totalFreeMinutes += slots.reduce((acc, s) => acc + (s.end - s.start), 0);
  }
  const totalFreeHours = Math.round((totalFreeMinutes / 60) * 10) / 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      alert('End time must be after start time.');
      return;
    }

    onAddCommitment({
      title: title.trim(),
      category,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
    });

    setTitle('');
    setShowAddModal(false);
    onTriggerReshuffle(`Added commitment: ${title.trim()}`);
  };

  const getCategoryIcon = (cat: CommitmentCategory) => {
    switch (cat) {
      case 'class':
        return <BookOpen className="w-3.5 h-3.5 text-blue-600" />;
      case 'work':
        return <Briefcase className="w-3.5 h-3.5 text-amber-600" />;
      case 'personal':
        return <Dumbbell className="w-3.5 h-3.5 text-emerald-600" />;
      case 'extracurricular':
        return <Users className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Availability Matrix</span>
            <span aria-hidden="true">·</span>
            <span>Weekly Commitments & Free Time</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-0.5">
            Class, Work & Weekly Schedule
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs hidden sm:block">
            <span className="text-stone-500 block">Total Free Study Time</span>
            <span className="font-bold text-stone-900 text-sm">
              {totalFreeHours} hours / week
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-stone-900 text-white hover:bg-stone-800 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Commitment</span>
          </button>
        </div>
      </div>

      {/* Capacity Explanation Callout */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <Info className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-900">
              How Autopilot Protects Your Real Schedule
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
              Every class, job shift, lab, workout, or club you add blocks out that exact time. Autopilot subtracts them from your day, adds 15-minute buffers, and schedules study blocks <strong>only into the remaining open slots</strong> shown at the bottom of each day.
            </p>
          </div>
        </div>

        <div className="bg-stone-50 border border-stone-200 p-3 rounded-xl text-xs font-mono shrink-0">
          <span className="text-stone-500 block text-[11px]">Free Study Capacity:</span>
          <span className="font-bold text-stone-900 text-sm">{totalFreeHours} hours / week</span>
        </div>
      </div>

      {/* 7-Day Timetable Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {DAYS.map((dayName, dayIndex) => {
          const dayItems = commitments
            .filter((c) => c.dayOfWeek === dayIndex)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          // Calculate free slots for this day of week
          const sampleDate = `2026-11-0${dayIndex + 1}`;
          const freeSlots = getFreeTimeSlotsForDay(sampleDate, commitments);
          const dayFreeHours =
            Math.round(
              (freeSlots.reduce((acc, s) => acc + (s.end - s.start), 0) / 60) * 10
            ) / 10;

          return (
            <div
              key={dayName}
              className="bg-white border border-stone-200 rounded-2xl p-3.5 flex flex-col min-h-[380px] shadow-xs"
            >
              {/* Day Header */}
              <div className="pb-2.5 mb-2.5 border-b border-stone-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-stone-900">{dayName}</h3>
                  <span className="text-[11px] text-stone-500 font-medium">
                    {dayFreeHours}h free
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-semibold bg-stone-100 px-1.5 py-0.5 rounded">
                  {dayItems.length} busy
                </span>
              </div>

              {/* Day Commitments */}
              <div className="space-y-2 flex-1">
                {dayItems.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-4 text-center">
                    <span className="text-[11px] text-stone-400 italic">
                      Full open day for deep study
                    </span>
                  </div>
                ) : (
                  dayItems.map((item) => (
                    <div
                      key={item.id}
                      className="group relative p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs transition-all hover:border-stone-300"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1.5 font-bold text-stone-900 text-[11px]">
                          {getCategoryIcon(item.category)}
                          <span className="line-clamp-1">{item.title}</span>
                        </div>

                        <button
                          onClick={() => {
                            onDeleteCommitment(item.id);
                            onTriggerReshuffle(`Removed ${item.title}`);
                          }}
                          className="text-stone-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                          title="Delete commitment"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[10px] text-stone-500 font-mono">
                        <span>
                          {item.startTime} – {item.endTime}
                        </span>
                        <span className="capitalize">{item.category}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Free Slots Footer */}
              <div className="pt-2.5 mt-2.5 border-t border-stone-100">
                <span className="text-[10px] font-bold text-stone-600 block mb-1">
                  Open Free Slots:
                </span>
                <div className="flex flex-wrap gap-1">
                  {freeSlots.map((slot, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-amber-50 text-amber-950 border border-amber-200 px-1.5 py-0.5 rounded-md font-mono font-medium"
                    >
                      {minutesToTime(slot.start)}–{minutesToTime(slot.end)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Commitment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">
                Add Weekly Commitment
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xs font-medium"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Commitment Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS 189 Lecture or Campus Job Shift"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CommitmentCategory)}
                    className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                  >
                    <option value="class">Class / Lecture / Lab</option>
                    <option value="work">Work Shift / Job</option>
                    <option value="personal">Gym / Health / Meal</option>
                    <option value="extracurricular">Club / Extracurricular</option>
                    <option value="commute">Commute / Travel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Day of Week
                  </label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                  >
                    {DAYS.map((d, idx) => (
                      <option key={d} value={idx}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-stone-900 text-white hover:bg-stone-800 shadow-xs"
                >
                  Save & Reshuffle Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
