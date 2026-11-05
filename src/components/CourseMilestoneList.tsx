import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  Clock,
  Percent,
  CheckCircle2,
  Circle,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { Course, Milestone, MilestoneType, DifficultyLevel } from '../types';

interface CourseMilestoneListProps {
  courses: Course[];
  milestones: Milestone[];
  onOpenUpload: () => void;
  onUpdateMilestone: (updated: Milestone) => void;
  onDeleteMilestone: (id: string) => void;
  onAddMilestone: (milestone: Omit<Milestone, 'id'>) => void;
  onTriggerReshuffle: (reason?: string) => void;
}

export const CourseMilestoneList: React.FC<CourseMilestoneListProps> = ({
  courses,
  milestones,
  onOpenUpload,
  onUpdateMilestone,
  onDeleteMilestone,
  onAddMilestone,
  onTriggerReshuffle,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [targetCourseForAdd, setTargetCourseForAdd] = useState<string>(courses[0]?.id || '');

  // Add form fields
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<MilestoneType>('assignment');
  const [newDueDate, setNewDueDate] = useState('2026-11-20T23:59');
  const [newWeight, setNewWeight] = useState(5);
  const [newPrepHours, setNewPrepHours] = useState(6);
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('medium');
  const [newDescription, setNewDescription] = useState('');

  const filteredCourses =
    selectedCourseFilter === 'all'
      ? courses
      : courses.filter((c) => c.id === selectedCourseFilter);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !targetCourseForAdd) return;

    onAddMilestone({
      courseId: targetCourseForAdd,
      title: newTitle.trim(),
      type: newType,
      dueDate: newDueDate,
      weightPercent: Number(newWeight),
      estimatedPrepHours: Number(newPrepHours),
      completedHours: 0,
      difficulty: newDifficulty,
      description: newDescription.trim(),
      status: 'upcoming',
      prepMilestones: [
        {
          id: `p-${Date.now()}-1`,
          title: `Initial research and planning for ${newTitle}`,
          recommendedHours: Math.round(newPrepHours * 0.4 * 10) / 10,
          daysBeforeDue: 4,
        },
        {
          id: `p-${Date.now()}-2`,
          title: `Execution and review for ${newTitle}`,
          recommendedHours: Math.round(newPrepHours * 0.6 * 10) / 10,
          daysBeforeDue: 1,
        },
      ],
    });

    // Reset & close
    setNewTitle('');
    setNewDescription('');
    setShowAddModal(false);
    onTriggerReshuffle(`Added new milestone: ${newTitle}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Course Catalog & Syllabi Breakdown</span>
            <span aria-hidden="true">·</span>
            <span>{courses.length} Enrolled Courses</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 mt-0.5">
            Syllabi, Deliverables & Grade Weights
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-white border border-stone-200 text-stone-800 hover:bg-stone-50 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-stone-600" />
            <span>Add Deliverable</span>
          </button>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 text-stone-950 hover:bg-amber-400 shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Upload New Syllabus</span>
          </button>
        </div>
      </div>

      {/* User-friendly explanation card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
          <Info className="w-5 h-5 text-amber-700" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-bold text-stone-900">
            How Syllabi Drive Your Study Plan
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed">
            Every deliverable below was extracted from your course syllabi. Notice the <strong>grade percentage</strong> on each item: Autopilot uses this to allocate study blocks proportional to what counts most. If a professor shifts a date, click the edit icon on any row to change it—Autopilot will automatically rebalance your semester.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-stone-100 rounded-xl overflow-x-auto">
        <button
          onClick={() => setSelectedCourseFilter('all')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
            selectedCourseFilter === 'all'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          All Courses ({courses.length})
        </button>
        {courses.map((course) => (
          <button
            key={course.id}
            onClick={() => setSelectedCourseFilter(course.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              selectedCourseFilter === course.id
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {course.code}
          </button>
        ))}
      </div>

      {/* Course Cards */}
      <div className="space-y-6">
        {filteredCourses.map((course) => {
          const courseMilestones = milestones
            .filter((m) => m.courseId === course.id)
            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

          const totalWeight = courseMilestones.reduce((acc, m) => acc + m.weightPercent, 0);
          const totalPrepHours = courseMilestones.reduce((acc, m) => acc + m.estimatedPrepHours, 0);

          return (
            <div
              key={course.id}
              className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs"
            >
              {/* Course Header Banner */}
              <div className="bg-stone-50 border-b border-stone-200 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <span className="font-bold text-stone-900 text-sm">{course.code}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-medium">{course.instructor || 'Faculty Staff'}</span>
                  </div>
                  <h2 className="text-base font-bold text-stone-900 mt-0.5">
                    {course.name}
                  </h2>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-stone-500 block">Grade Mapped</span>
                    <span
                      className={`font-bold ${
                        totalWeight >= 95 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {totalWeight}% of syllabus mapped
                    </span>
                  </div>
                  <div className="border-l border-stone-200 pl-4">
                    <span className="text-stone-500 block">Total Prep</span>
                    <span className="font-bold text-stone-900">{totalPrepHours} hours</span>
                  </div>
                </div>
              </div>

              {/* Milestones Table */}
              <div className="divide-y divide-stone-100">
                {courseMilestones.map((m) => {
                  const isEditing = editingMilestoneId === m.id;
                  const isCompleted = m.status === 'completed';
                  const isDropped = m.status === 'dropped';
                  const isTrimmed = m.status === 'trimmed';

                  return (
                    <div
                      key={m.id}
                      className={`p-4 sm:px-6 transition-colors ${
                        isCompleted
                          ? 'bg-stone-50/50 opacity-70'
                          : isDropped
                          ? 'bg-rose-50/30 line-through opacity-60'
                          : 'hover:bg-stone-50/60'
                      }`}
                    >
                      {isEditing ? (
                        /* Inline Edit Row */
                        <div className="space-y-3 bg-stone-50 p-4 rounded-xl border-2 border-amber-300">
                          <span className="text-xs font-bold text-stone-900">
                            Edit Deliverable / Update Date
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                                Deliverable Title
                              </label>
                              <input
                                type="text"
                                value={m.title}
                                onChange={(e) =>
                                  onUpdateMilestone({ ...m, title: e.target.value })
                                }
                                className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                                Due Date (Triggers Autopilot reshuffle)
                              </label>
                              <input
                                type="datetime-local"
                                value={m.dueDate.includes('T') ? m.dueDate : `${m.dueDate}T23:59`}
                                onChange={(e) => {
                                  onUpdateMilestone({ ...m, dueDate: e.target.value });
                                }}
                                className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                                Est. Prep Hours
                              </label>
                              <input
                                type="number"
                                value={m.estimatedPrepHours}
                                onChange={(e) =>
                                  onUpdateMilestone({
                                    ...m,
                                    estimatedPrepHours: Number(e.target.value),
                                  })
                                }
                                className="w-full text-xs bg-white border border-stone-200 rounded-lg p-2 font-medium"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              onClick={() => {
                                setEditingMilestoneId(null);
                                onTriggerReshuffle(`Updated ${m.title}`);
                              }}
                              className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-bold"
                            >
                              Save & Reshuffle Plan
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Standard Row */
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <button
                              onClick={() => {
                                const nextStatus =
                                  m.status === 'completed' ? 'upcoming' : 'completed';
                                onUpdateMilestone({ ...m, status: nextStatus });
                                onTriggerReshuffle(
                                  nextStatus === 'completed'
                                    ? `Completed ${m.title}`
                                    : `Reopened ${m.title}`
                                );
                              }}
                              className="mt-1 text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                              title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-stone-300 hover:text-emerald-500" />
                              )}
                            </button>

                            <div>
                              <div className="flex items-center gap-2 text-xs text-stone-500">
                                <span className="capitalize font-bold text-stone-800">
                                  {m.type}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="font-mono text-stone-700 font-medium">
                                  Due {m.dueDate.split('T')[0]}
                                </span>
                                <span aria-hidden="true">·</span>
                                <span className="text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                  {m.weightPercent}% of grade
                                </span>
                                {isTrimmed && (
                                  <>
                                    <span aria-hidden="true">·</span>
                                    <span className="text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                                      Trimmed (-{m.triageCutHours}h)
                                    </span>
                                  </>
                                )}
                              </div>

                              <h3
                                className={`text-base font-semibold mt-0.5 ${
                                  isCompleted ? 'line-through text-stone-400' : 'text-stone-900'
                                }`}
                              >
                                {m.title}
                              </h3>

                              {m.description && (
                                <p className="text-xs text-stone-500 mt-0.5 line-clamp-1 leading-relaxed">
                                  {m.description}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                            <div className="text-right text-xs">
                              <span className="text-stone-500 block">Prep Time</span>
                              <span className="font-bold text-stone-800">
                                {m.estimatedPrepHours} hours
                              </span>
                            </div>

                            <button
                              onClick={() => setEditingMilestoneId(m.id)}
                              className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                              title="Edit due date or details"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                onDeleteMilestone(m.id);
                                onTriggerReshuffle(`Removed ${m.title}`);
                              }}
                              className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                              title="Delete deliverable"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Deliverable Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h2 className="text-base font-bold text-stone-900">
                Add Deliverable / Exam to Semester
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-600 text-xs font-medium"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Course
                </label>
                <select
                  value={targetCourseForAdd}
                  onChange={(e) => setTargetCourseForAdd(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} – {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midterm 3 or Problem Set 5"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as MilestoneType)}
                    className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                  >
                    <option value="assignment">Assignment / Problem Set</option>
                    <option value="midterm">Midterm Exam</option>
                    <option value="final">Final Exam</option>
                    <option value="project">Project / Paper</option>
                    <option value="quiz">Quiz</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Weight (% of Course Grade)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Est. Prep Hours Needed
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    max="80"
                    value={newPrepHours}
                    onChange={(e) => setNewPrepHours(Number(e.target.value))}
                    className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description / Topic Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Key topics covered, format, or grading criteria..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full text-xs bg-white border border-stone-200 rounded-xl p-2.5 text-stone-800 font-medium"
                />
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
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-stone-900 text-white hover:bg-stone-800 shadow-xs"
                >
                  Add & Reshuffle Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
