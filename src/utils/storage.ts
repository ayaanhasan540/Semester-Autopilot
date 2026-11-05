import { Course, Milestone, WeeklyCommitment, StudySession } from '../types';
import { createInitialSemesterData } from '../data/mockSyllabi';
import { generateStudySchedule } from './scheduler';

const STORAGE_KEY = 'semester_autopilot_data_v1';

export interface AppStateData {
  courses: Course[];
  milestones: Milestone[];
  commitments: WeeklyCommitment[];
  sessions: StudySession[];
  currentDate: string; // YYYY-MM-DD
  version: number;
}

export function loadSavedState(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.courses) && parsed.courses.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
  }

  // Fallback to fresh initial seed
  return getFreshInitialState();
}

export function getFreshInitialState(): AppStateData {
  const currentDate = '2026-11-05'; // Thursday
  const { courses, milestones, commitments } = createInitialSemesterData();
  const { sessions } = generateStudySchedule(milestones, commitments, [], currentDate);

  return {
    courses,
    milestones,
    commitments,
    sessions,
    currentDate,
    version: 1,
  };
}

export function saveState(data: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}

export function exportStateAsJSON(data: AppStateData): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `semester-autopilot-export-${data.currentDate}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
