export type MilestoneType =
  | 'exam'
  | 'midterm'
  | 'final'
  | 'assignment'
  | 'project'
  | 'quiz'
  | 'reading'
  | 'presentation'
  | 'other';

export type DifficultyLevel = 'low' | 'medium' | 'high';

export interface PrepMilestone {
  id: string;
  title: string;
  recommendedHours: number;
  daysBeforeDue: number;
  tips?: string;
  completed?: boolean;
}

export interface Milestone {
  id: string;
  courseId: string;
  title: string;
  type: MilestoneType;
  dueDate: string; // YYYY-MM-DD or YYYY-MM-DDTHH:mm
  weightPercent: number; // e.g. 20 for 20%
  estimatedPrepHours: number;
  completedHours: number;
  difficulty: DifficultyLevel;
  description?: string;
  prepMilestones: PrepMilestone[];
  status: 'upcoming' | 'in_progress' | 'completed' | 'dropped' | 'trimmed';
  triageCutHours?: number; // hours cut if triaged
  triageAction?: 'protect' | 'trim' | 'drop';
}

export interface Course {
  id: string;
  code: string; // e.g. "CS 189"
  name: string; // e.g. "Machine Learning"
  instructor?: string;
  color: string; // Tailwind color key or hex
  gradingScale?: {
    category: string;
    percentage: number;
  }[];
  notes?: string;
}

export type CommitmentCategory =
  | 'class'
  | 'work'
  | 'personal'
  | 'extracurricular'
  | 'commute'
  | 'sleep';

export interface WeeklyCommitment {
  id: string;
  title: string;
  category: CommitmentCategory;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  courseId?: string; // if it's a class
  color?: string;
}

export interface StudySession {
  id: string;
  milestoneId: string;
  courseId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  durationMinutes: number;
  completed: boolean;
  completedAt?: string;
  skipped: boolean;
  notes?: string;
}

export interface WeekWorkload {
  weekNumber: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalPrepHoursNeeded: number;
  freeHoursAvailable: number;
  totalGradeWeightDue: number;
  milestonesDue: Milestone[];
  riskLevel: 'safe' | 'moderate' | 'critical';
  crunchReason?: string;
  advanceAdvice?: string;
}

export interface TriageItem {
  milestoneId: string;
  milestoneTitle: string;
  courseCode: string;
  currentPrepHours: number;
  weightPercent: number;
  hoursPerWeightPoint: number; // higher = better candidate to drop/trim
  suggestedAction: 'protect' | 'trim' | 'drop';
  newPrepHours: number;
  hoursSaved: number;
  gradeRisk: string;
  rationale: string;
}

export interface TriagePlan {
  deficitHours: number;
  items: TriageItem[];
  totalHoursSaved: number;
  aiVerdict?: string;
  aiCalmingAdvice?: string;
}
