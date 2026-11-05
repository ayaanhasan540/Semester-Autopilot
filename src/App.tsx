import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { TodayAgenda } from './components/TodayAgenda';
import { WorkloadCrunchView } from './components/WorkloadCrunchView';
import { CourseMilestoneList } from './components/CourseMilestoneList';
import { CommitmentManager } from './components/CommitmentManager';
import { SyllabusUploadModal } from './components/SyllabusUploadModal';
import { TriageModal } from './components/TriageModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { ReshuffleBanner } from './components/ReshuffleBanner';
import { OnboardingGuide } from './components/OnboardingGuide';
import {
  loadSavedState,
  saveState,
  getFreshInitialState,
  exportStateAsJSON,
  AppStateData,
} from './utils/storage';
import {
  reshuffleStudyPlan,
  generateStudySchedule,
  calculateSemesterWorkload,
} from './utils/scheduler';
import { Course, Milestone, WeeklyCommitment, StudySession, TriageItem } from './types';

export default function App() {
  const [appState, setAppState] = useState<AppStateData>(() => loadSavedState());
  const [activeTab, setActiveTab] = useState<'agenda' | 'workload' | 'syllabi' | 'commitments'>('agenda');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isTriageOpen, setIsTriageOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [focusingSession, setFocusingSession] = useState<StudySession | null>(null);

  // Notification state
  const [reshuffleNotice, setReshuffleNotice] = useState<string | null>(null);

  // Save to localStorage on state change
  useEffect(() => {
    saveState(appState);
  }, [appState]);

  // Workload crunch check for header badge
  const workloads = calculateSemesterWorkload(appState.milestones, appState.commitments);
  const hasCrunch = workloads.some((w) => w.riskLevel === 'critical');

  const showNotice = (msg: string) => {
    setReshuffleNotice(msg);
    setTimeout(() => {
      setReshuffleNotice((current) => (current === msg ? null : current));
    }, 6000);
  };

  // Reshuffle core handler
  const handleTriggerReshuffle = (reason?: string) => {
    const { sessions, changesSummary } = reshuffleStudyPlan(
      appState.milestones,
      appState.commitments,
      appState.sessions,
      appState.currentDate,
      reason
    );

    setAppState((prev) => ({
      ...prev,
      sessions,
    }));

    showNotice(changesSummary.join(' '));
  };

  // Toggle Session completion
  const handleToggleSessionComplete = (sessionId: string) => {
    const target = appState.sessions.find((s) => s.id === sessionId);
    if (!target) return;

    const nextCompleted = !target.completed;
    const durationHours = target.durationMinutes / 60;

    const updatedSessions = appState.sessions.map((s) =>
      s.id === sessionId
        ? {
            ...s,
            completed: nextCompleted,
            completedAt: nextCompleted ? new Date().toISOString() : undefined,
          }
        : s
    );

    // Update milestone completedHours
    const updatedMilestones = appState.milestones.map((m) => {
      if (m.id === target.milestoneId) {
        const delta = nextCompleted ? durationHours : -durationHours;
        const newCompleted = Math.max(0, m.completedHours + delta);
        return {
          ...m,
          completedHours: Math.round(newCompleted * 10) / 10,
          status:
            newCompleted >= m.estimatedPrepHours
              ? 'completed'
              : newCompleted > 0
              ? 'in_progress'
              : m.status,
        };
      }
      return m;
    });

    setAppState((prev) => ({
      ...prev,
      sessions: updatedSessions,
      milestones: updatedMilestones,
    }));
  };

  // Skip session & immediate reshuffle
  const handleSkipSession = (sessionId: string) => {
    const target = appState.sessions.find((s) => s.id === sessionId);
    if (!target) return;

    const updatedSessions = appState.sessions.map((s) =>
      s.id === sessionId ? { ...s, skipped: true } : s
    );

    const { sessions, changesSummary } = reshuffleStudyPlan(
      appState.milestones,
      appState.commitments,
      updatedSessions,
      appState.currentDate,
      `Skipped "${target.title}". Autopilot reallocated remaining prep hours into upcoming free blocks.`
    );

    setAppState((prev) => ({
      ...prev,
      sessions,
    }));

    showNotice(changesSummary.join(' '));
  };

  // Move milestone date (e.g. professor moved an exam or due date)
  const handleMoveMilestoneDate = (milestoneId: string, newDate: string) => {
    const milestone = appState.milestones.find((m) => m.id === milestoneId);
    if (!milestone) return;

    const updatedMilestones = appState.milestones.map((m) =>
      m.id === milestoneId
        ? {
            ...m,
            dueDate: newDate.includes('T') ? newDate : `${newDate}T23:59`,
          }
        : m
    );

    const { sessions, changesSummary } = reshuffleStudyPlan(
      updatedMilestones,
      appState.commitments,
      appState.sessions,
      appState.currentDate,
      `Professor moved due date for ${milestone.title} to ${newDate.split('T')[0]}. Autopilot redistributed all study sessions.`
    );

    setAppState((prev) => ({
      ...prev,
      milestones: updatedMilestones,
      sessions,
    }));

    showNotice(changesSummary.join(' '));
  };

  // Add parsed course & syllabus
  const handleCourseParsed = (course: Course, newMilestones: Milestone[]) => {
    const updatedCourses = [...appState.courses, course];
    const updatedMilestones = [...appState.milestones, ...newMilestones];

    const { sessions, changesSummary } = reshuffleStudyPlan(
      updatedMilestones,
      appState.commitments,
      appState.sessions,
      appState.currentDate,
      `Ingested syllabus for ${course.code}: ${course.name}. Scheduled ${newMilestones.length} new deliverables.`
    );

    setAppState((prev) => ({
      ...prev,
      courses: updatedCourses,
      milestones: updatedMilestones,
      sessions,
    }));

    showNotice(changesSummary.join(' '));
    setActiveTab('syllabi');
  };

  // Update milestone
  const handleUpdateMilestone = (updated: Milestone) => {
    const updatedMilestones = appState.milestones.map((m) =>
      m.id === updated.id ? updated : m
    );

    setAppState((prev) => ({
      ...prev,
      milestones: updatedMilestones,
    }));
  };

  // Delete milestone
  const handleDeleteMilestone = (id: string) => {
    const updatedMilestones = appState.milestones.filter((m) => m.id !== id);
    const updatedSessions = appState.sessions.filter((s) => s.milestoneId !== id);

    setAppState((prev) => ({
      ...prev,
      milestones: updatedMilestones,
      sessions: updatedSessions,
    }));
  };

  // Add manual milestone
  const handleAddMilestone = (milestoneData: Omit<Milestone, 'id'>) => {
    const newId = `m-custom-${Date.now()}`;
    const newMilestone: Milestone = {
      ...milestoneData,
      id: newId,
    };

    const updatedMilestones = [...appState.milestones, newMilestone];

    const { sessions } = reshuffleStudyPlan(
      updatedMilestones,
      appState.commitments,
      appState.sessions,
      appState.currentDate
    );

    setAppState((prev) => ({
      ...prev,
      milestones: updatedMilestones,
      sessions,
    }));
  };

  // Commitment handlers
  const handleAddCommitment = (cData: Omit<WeeklyCommitment, 'id'>) => {
    const newId = `com-${Date.now()}`;
    const newCommitment: WeeklyCommitment = {
      ...cData,
      id: newId,
    };

    const updatedCommitments = [...appState.commitments, newCommitment];

    const { sessions, changesSummary } = reshuffleStudyPlan(
      appState.milestones,
      updatedCommitments,
      appState.sessions,
      appState.currentDate,
      `Added weekly commitment "${newCommitment.title}". Adjusted free time windows.`
    );

    setAppState((prev) => ({
      ...prev,
      commitments: updatedCommitments,
      sessions,
    }));

    showNotice(changesSummary.join(' '));
  };

  const handleDeleteCommitment = (id: string) => {
    const updatedCommitments = appState.commitments.filter((c) => c.id !== id);

    const { sessions, changesSummary } = reshuffleStudyPlan(
      appState.milestones,
      updatedCommitments,
      appState.sessions,
      appState.currentDate,
      'Removed commitment and expanded study capacity.'
    );

    setAppState((prev) => ({
      ...prev,
      commitments: updatedCommitments,
      sessions,
    }));

    showNotice(changesSummary.join(' '));
  };

  // Apply Grade Triage recommendations
  const handleApplyTriage = (triagedItems: TriageItem[]) => {
    const triageMap = new Map(triagedItems.map((item) => [item.milestoneId, item]));

    const updatedMilestones = appState.milestones.map((m) => {
      const triage = triageMap.get(m.id);
      if (!triage) return m;

      if (triage.suggestedAction === 'drop') {
        return {
          ...m,
          status: 'dropped' as const,
          triageCutHours: m.estimatedPrepHours,
          triageAction: 'drop' as const,
        };
      } else if (triage.suggestedAction === 'trim') {
        return {
          ...m,
          status: 'trimmed' as const,
          triageCutHours: triage.hoursSaved,
          triageAction: 'trim' as const,
        };
      }
      return {
        ...m,
        triageAction: 'protect' as const,
      };
    });

    const { sessions, changesSummary } = reshuffleStudyPlan(
      updatedMilestones,
      appState.commitments,
      appState.sessions,
      appState.currentDate,
      'Applied Grade Triage: trimmed low-leverage hours to guarantee maximum score on high-weight exams.'
    );

    setAppState((prev) => ({
      ...prev,
      milestones: updatedMilestones,
      sessions,
    }));

    showNotice(changesSummary.join(' '));
  };

  // Frontload a crunch week
  const handleFrontloadWeek = (weekNumber: number) => {
    handleTriggerReshuffle(
      `Frontloaded study sessions for Week ${weekNumber + 8} into preceding open study slots.`
    );
  };

  // Reset to fresh initial data
  const handleResetData = () => {
    if (confirm('Reset to standard sample semester with Berkeley CS 189, ECON 101, CHEM 3A & HIST 102?')) {
      const fresh = getFreshInitialState();
      setAppState(fresh);
      showNotice('Reset to full sample semester.');
    }
  };

  // Active focus session context
  const focusMilestone = focusingSession
    ? appState.milestones.find((m) => m.id === focusingSession.milestoneId)
    : undefined;
  const focusCourse = focusingSession
    ? appState.courses.find((c) => c.id === focusingSession.courseId)
    : undefined;

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenTriage={() => setIsTriageOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onReshuffle={() => handleTriggerReshuffle('Manual reshuffle executed')}
        onExport={() => exportStateAsJSON(appState)}
        onResetData={handleResetData}
        currentDate={appState.currentDate}
        hasCrunch={hasCrunch}
      />

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'agenda' && (
          <TodayAgenda
            currentDate={appState.currentDate}
            onSetCurrentDate={(newDate) =>
              setAppState((prev) => ({ ...prev, currentDate: newDate }))
            }
            sessions={appState.sessions}
            milestones={appState.milestones}
            courses={appState.courses}
            commitments={appState.commitments}
            onToggleSessionComplete={handleToggleSessionComplete}
            onSkipSession={handleSkipSession}
            onStartFocus={(session) => setFocusingSession(session)}
            onMoveMilestoneDate={handleMoveMilestoneDate}
            onTriggerReshuffle={handleTriggerReshuffle}
            onOpenTriage={() => setIsTriageOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
          />
        )}

        {activeTab === 'workload' && (
          <WorkloadCrunchView
            milestones={appState.milestones}
            courses={appState.courses}
            commitments={appState.commitments}
            onOpenTriage={() => setIsTriageOpen(true)}
            onFrontloadWeek={handleFrontloadWeek}
          />
        )}

        {activeTab === 'syllabi' && (
          <CourseMilestoneList
            courses={appState.courses}
            milestones={appState.milestones}
            onOpenUpload={() => setIsUploadOpen(true)}
            onUpdateMilestone={handleUpdateMilestone}
            onDeleteMilestone={handleDeleteMilestone}
            onAddMilestone={handleAddMilestone}
            onTriggerReshuffle={handleTriggerReshuffle}
          />
        )}

        {activeTab === 'commitments' && (
          <CommitmentManager
            commitments={appState.commitments}
            onAddCommitment={handleAddCommitment}
            onDeleteCommitment={handleDeleteCommitment}
            onTriggerReshuffle={handleTriggerReshuffle}
          />
        )}
      </main>

      {/* Modals & Overlays */}
      <OnboardingGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenUpload={() => {
          setIsGuideOpen(false);
          setIsUploadOpen(true);
        }}
        onOpenTriage={() => {
          setIsGuideOpen(false);
          setIsTriageOpen(true);
        }}
        onGoToTab={(tab) => {
          setIsGuideOpen(false);
          setActiveTab(tab);
        }}
        onSimulateSkip={() => {
          setIsGuideOpen(false);
          if (appState.sessions.length > 0) {
            handleSkipSession(appState.sessions[0].id);
          }
        }}
      />

      <SyllabusUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onCourseParsed={handleCourseParsed}
      />

      <TriageModal
        isOpen={isTriageOpen}
        onClose={() => setIsTriageOpen(false)}
        milestones={appState.milestones}
        courses={appState.courses}
        commitments={appState.commitments}
        onApplyTriage={handleApplyTriage}
      />

      <FocusTimerModal
        session={focusingSession}
        milestone={focusMilestone}
        course={focusCourse}
        onClose={() => setFocusingSession(null)}
        onCompleteSession={handleToggleSessionComplete}
      />

      {/* Reshuffle Notification Toast */}
      <ReshuffleBanner
        message={reshuffleNotice}
        onDismiss={() => setReshuffleNotice(null)}
      />
    </div>
  );
}
