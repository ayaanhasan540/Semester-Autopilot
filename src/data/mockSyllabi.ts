import { Course, Milestone, WeeklyCommitment } from '../types';

export interface SampleSyllabus {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  color: string;
  text: string;
  defaultMilestones: Omit<Milestone, 'id' | 'courseId'>[];
}

export const SAMPLE_SYLLABI: SampleSyllabus[] = [
  {
    id: 'cs189',
    courseCode: 'CS 189',
    courseName: 'Introduction to Machine Learning',
    instructor: 'Prof. J. Malik & Prof. S. Russell',
    color: 'emerald',
    text: `UNIVERSITY OF CALIFORNIA, BERKELEY
DEPARTMENT OF ELECTRICAL ENGINEERING & COMPUTER SCIENCES
CS 189: INTRODUCTION TO MACHINE LEARNING (FALL SEMESTER)

INSTRUCTOR: Prof. J. Malik & Prof. S. Russell
OFFICE HOURS: Tuesdays 2-4pm, 725 Soda Hall
PREREQUISITES: Linear Algebra (Math 54/EECS 16A), Probability (Stat 134), Data Structures (CS 61B)

GRADING POLICY:
- Midterm 1: 20%
- Midterm 2: 20%
- Final Project (Group of 2-3): 25%
- 5 Homework Problem Sets: 25% (5% each)
- Discussion Quizzes: 10%

COURSE SCHEDULE & KEY DEADLINES:
- Week 4: Homework 1 (Perceptron & Linear Regression) - Due Sep 28 [Weight: 5%]
- Week 7: Midterm Exam 1 (Supervised Learning, Optimization) - Oct 19 [Weight: 20%]
- Week 9: Homework 3 (Support Vector Machines & Kernels) - Nov 02 [Weight: 5%]
- Week 10: Homework 4 (Decision Trees & Random Forests) - Due Nov 08 [Weight: 5%]
- Week 11: Midterm Exam 2 (Neural Networks & Regularization) - Nov 16 [Weight: 20%]
- Week 12: Final Project Milestone 2 (Architecture & Baselines) - Nov 23 [Weight: 10%]
- Week 14: Homework 5 (Unsupervised Learning & PCA) - Dec 03 [Weight: 5%]
- Week 15: Final Project Final Paper & Code Submission - Dec 11 [Weight: 15%]

COLLABORATION & LATE POLICY:
Late assignments lose 20% per day. The midterms are closed book with one double-sided formula sheet.`,
    defaultMilestones: [
      {
        title: 'Homework 4: Decision Trees & Random Forests',
        type: 'assignment',
        dueDate: '2026-11-08T23:59',
        weightPercent: 5,
        estimatedPrepHours: 6,
        completedHours: 2,
        difficulty: 'medium',
        description: 'Implement impurity criteria (Gini, Entropy), tree pruning, and bagging random forest ensemble on synthetic and MNIST subsets.',
        status: 'in_progress',
        prepMilestones: [
          { id: 'p1', title: 'Derive entropy and information gain equations', recommendedHours: 2, daysBeforeDue: 4, completed: true },
          { id: 'p2', title: 'Code recursive DecisionNode split & evaluate', recommendedHours: 2.5, daysBeforeDue: 2 },
          { id: 'p3', title: 'Write up test accuracy charts & writeup', recommendedHours: 1.5, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Midterm Exam 2: Deep Learning & Kernels',
        type: 'midterm',
        dueDate: '2026-11-16T19:00',
        weightPercent: 20,
        estimatedPrepHours: 16,
        completedHours: 0,
        difficulty: 'high',
        description: 'Comprehensive exam covering kernels, SVM dual form, backpropagation vector calculus, optimization (SGD/Adam), and regularization.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'p4', title: 'Review lecture slides & build formula sheet', recommendedHours: 4, daysBeforeDue: 8 },
          { id: 'p5', title: 'Work through 2024 & 2025 past exams', recommendedHours: 6, daysBeforeDue: 5 },
          { id: 'p6', title: 'Drill backprop Jacobians & loss derivations', recommendedHours: 4, daysBeforeDue: 3 },
          { id: 'p7', title: 'Timed practice exam under exam conditions', recommendedHours: 2, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Final Project Milestone 2: Baselines & Model',
        type: 'project',
        dueDate: '2026-11-23T23:59',
        weightPercent: 10,
        estimatedPrepHours: 10,
        completedHours: 0,
        difficulty: 'high',
        description: 'Submit intermediate progress report with baseline model benchmarks, error analysis, and pipeline architecture.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'p8', title: 'Train baseline ResNet and TabNet models', recommendedHours: 4, daysBeforeDue: 6 },
          { id: 'p9', title: 'Benchmark validation loss and confusion matrices', recommendedHours: 3, daysBeforeDue: 3 },
          { id: 'p10', title: 'Format report tables and write discussion', recommendedHours: 3, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Homework 5: PCA & Spectral Clustering',
        type: 'assignment',
        dueDate: '2026-12-03T23:59',
        weightPercent: 5,
        estimatedPrepHours: 5,
        completedHours: 0,
        difficulty: 'medium',
        description: 'Eigenvalue decomposition, SVD, dimensionality reduction on face dataset.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'p11', title: 'Math derivation of maximum variance projection', recommendedHours: 2, daysBeforeDue: 3 },
          { id: 'p12', title: 'Python SVD implementation & reconstruction', recommendedHours: 3, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Final Project Submission & Codebase',
        type: 'project',
        dueDate: '2026-12-11T17:00',
        weightPercent: 15,
        estimatedPrepHours: 18,
        completedHours: 0,
        difficulty: 'high',
        description: 'Complete 8-page NeurIPS format paper, GitHub repository, ablation study, and qualitative results.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'p13', title: 'Run ablation experiments and hyperparameter sweep', recommendedHours: 6, daysBeforeDue: 7 },
          { id: 'p14', title: 'Write methodology & results sections', recommendedHours: 6, daysBeforeDue: 4 },
          { id: 'p15', title: 'Clean codebase & document README reproducibility', recommendedHours: 3, daysBeforeDue: 2 },
          { id: 'p16', title: 'Final proofread and LaTeX compile', recommendedHours: 3, daysBeforeDue: 1 },
        ],
      },
    ],
  },
  {
    id: 'econ101',
    courseCode: 'ECON 101',
    courseName: 'Intermediate Microeconomic Theory',
    instructor: 'Prof. D. Card',
    color: 'amber',
    text: `ECON 101: INTERMEDIATE MICROECONOMICS
Fall Term
Instructor: Prof. David Card

GRADE WEIGHTS:
- Problem Sets (4 total): 20% (5% each)
- Midterm 1: 20% (Week 6)
- Midterm 2: 25% (Week 11 - Nov 17)
- Final Comprehensive Exam: 35% (Dec 14)

SCHEDULE OF UPCOMING DELIVERABLES:
- Problem Set 3 (Monopoly Pricing & Cournot Oligopoly) - Due Nov 10 at 5pm [5%]
- Midterm Exam 2 (General Equilibrium & Welfare Economics) - Nov 17 at 11am [25%]
- Problem Set 4 (Game Theory & Information Asymmetry) - Due Dec 01 at 5pm [5%]
- Final Exam (Cumulative) - Dec 14 at 9am [35%]`,
    defaultMilestones: [
      {
        title: 'Problem Set 3: Cournot & Bertrand Models',
        type: 'assignment',
        dueDate: '2026-11-10T17:00',
        weightPercent: 5,
        estimatedPrepHours: 5,
        completedHours: 0,
        difficulty: 'medium',
        description: 'Calculate reaction functions, Nash equilibria, deadweight loss under duopoly vs cartel collusion.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'e1', title: 'Solve Cournot and Stackelberg numerical problems', recommendedHours: 3, daysBeforeDue: 3 },
          { id: 'e2', title: 'Graph isoprofit curves and write explanations', recommendedHours: 2, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Midterm 2: General Equilibrium & Welfare',
        type: 'midterm',
        dueDate: '2026-11-17T11:00',
        weightPercent: 25,
        estimatedPrepHours: 14,
        completedHours: 0,
        difficulty: 'high',
        description: 'Edgeworth box analysis, Pareto efficiency, First & Second Fundamental Theorems of Welfare Economics, externalities & Pigouvian taxes.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'e3', title: 'Review lecture notes & trade contract curves', recommendedHours: 4, daysBeforeDue: 7 },
          { id: 'e4', title: 'Complete 3 previous midterm exams', recommendedHours: 5, daysBeforeDue: 4 },
          { id: 'e5', title: 'Derive social optimum with negative production externalities', recommendedHours: 3, daysBeforeDue: 2 },
          { id: 'e6', title: 'Formula check and final questions with TA', recommendedHours: 2, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Problem Set 4: Game Theory & Signaling',
        type: 'assignment',
        dueDate: '2026-12-01T17:00',
        weightPercent: 5,
        estimatedPrepHours: 4.5,
        completedHours: 0,
        difficulty: 'medium',
        description: 'Subgame perfect Nash equilibrium, repeated games, Spence labor market signaling model.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'e7', title: 'Solve extensive form backward induction trees', recommendedHours: 2.5, daysBeforeDue: 3 },
          { id: 'e8', title: 'Calculate pooling and separating equilibria', recommendedHours: 2, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Final Examination (Comprehensive)',
        type: 'final',
        dueDate: '2026-12-14T09:00',
        weightPercent: 35,
        estimatedPrepHours: 20,
        completedHours: 0,
        difficulty: 'high',
        description: 'Comprehensive 3-hour exam covering consumer theory, producer theory, equilibrium, and market failures.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'e9', title: 'Comprehensive concept review: Consumer & Firm', recommendedHours: 6, daysBeforeDue: 9 },
          { id: 'e10', title: 'Full past finals walkthrough (2023-2025)', recommendedHours: 8, daysBeforeDue: 5 },
          { id: 'e11', title: 'Targeted drill on hardest problems (Slutsky, Monopoly)', recommendedHours: 4, daysBeforeDue: 3 },
          { id: 'e12', title: 'Rest and light review before exam day', recommendedHours: 2, daysBeforeDue: 1 },
        ],
      },
    ],
  },
  {
    id: 'chem3a',
    courseCode: 'CHEM 3A',
    courseName: 'Organic Chemistry I',
    instructor: 'Prof. K. Vollhardt',
    color: 'sky',
    text: `CHEM 3A: CHEMICAL STRUCTURE AND REACTIVITY
Semester Syllabus
Instructor: Prof. K. Vollhardt

EVALUATION:
- Midterm 1: 20%
- Midterm 2: 20% (Nov 19)
- Laboratory Performance & Reports: 25%
- Quizzes & Homework: 10%
- Final Exam: 25% (Dec 16)

KEY UPCOMING DATES:
- Lab Report 4 (Thin Layer Chromatography & Column Isolation) - Nov 12 at 1pm [5%]
- Midterm Exam 2 (Stereochemistry, SN1/SN2, E1/E2 Mechanisms) - Nov 19 at 6pm [20%]
- Lab Report 5 (Synthesis of Aspirin & Recrystallization) - Nov 25 at 1pm [5%]
- Final Comprehensive Exam - Dec 16 at 3pm [25%]`,
    defaultMilestones: [
      {
        title: 'Lab Report 4: TLC & Column Chromatography',
        type: 'assignment',
        dueDate: '2026-11-12T13:00',
        weightPercent: 5,
        estimatedPrepHours: 4,
        completedHours: 0,
        difficulty: 'low',
        description: 'Rf calculations, percent recovery, mechanism explanation of stationary phase polarity.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'c1', title: 'Calculate yields & tabulate Rf values', recommendedHours: 2, daysBeforeDue: 2 },
          { id: 'c2', title: 'Write discussion and error analysis', recommendedHours: 2, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Midterm Exam 2: Reactions & Mechanisms',
        type: 'midterm',
        dueDate: '2026-11-19T18:00',
        weightPercent: 20,
        estimatedPrepHours: 15,
        completedHours: 0,
        difficulty: 'high',
        description: 'Stereochemistry (R/S, enantiomers, diastereomers), SN1 vs SN2 kinetics and solvent effects, E1 vs E2 regioselectivity (Zaitsev/Hofmann).',
        status: 'upcoming',
        prepMilestones: [
          { id: 'c3', title: 'Create mechanism flashcards & arrow pushing rules', recommendedHours: 4, daysBeforeDue: 7 },
          { id: 'c4', title: 'Complete chapter 6-8 practice problem sets', recommendedHours: 5, daysBeforeDue: 4 },
          { id: 'c5', title: 'Work through past 3 midterms', recommendedHours: 4, daysBeforeDue: 2 },
          { id: 'c6', title: 'Review tricky stereochemical inversion cases', recommendedHours: 2, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Lab Report 5: Aspirin Synthesis & IR Spec',
        type: 'assignment',
        dueDate: '2026-11-25T13:00',
        weightPercent: 5,
        estimatedPrepHours: 4.5,
        completedHours: 0,
        difficulty: 'medium',
        description: 'Salicylic acid esterification, percent yield, interpretation of carbonyl infrared stretch.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'c7', title: 'Analyze IR spectroscopy peaks & purity', recommendedHours: 2, daysBeforeDue: 2 },
          { id: 'c8', title: 'Finalize post-lab questions and writeup', recommendedHours: 2.5, daysBeforeDue: 1 },
        ],
      },
      {
        title: 'Final Examination (Comprehensive)',
        type: 'final',
        dueDate: '2026-12-16T15:00',
        weightPercent: 25,
        estimatedPrepHours: 18,
        completedHours: 0,
        difficulty: 'high',
        description: 'Comprehensive examination of all organic transformations, retrosynthetic analysis, and NMR interpretation.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'c9', title: 'Retrosynthesis roadmaps & functional group interconversion', recommendedHours: 6, daysBeforeDue: 8 },
          { id: 'c10', title: 'Full exam simulations with time limit', recommendedHours: 7, daysBeforeDue: 4 },
          { id: 'c11', title: 'NMR splitting patterns and proton shifts', recommendedHours: 3, daysBeforeDue: 2 },
          { id: 'c12', title: 'Final sanity check on key reagents', recommendedHours: 2, daysBeforeDue: 1 },
        ],
      },
    ],
  },
  {
    id: 'hist102',
    courseCode: 'HIST 102',
    courseName: 'Global History: The Modern Era',
    instructor: 'Prof. A. Hochschild',
    color: 'rose',
    text: `HIST 102: GLOBAL HISTORY SINCE 1900
Semester Syllabus
Instructor: Prof. Adam Hochschild

GRADING BREAKDOWN:
- Primary Source Analysis: 15%
- Midterm Essay Exam: 20%
- Term Research Paper (10-12 pages): 35% (Nov 24)
- Participation & Weekly Reading Reflections: 10%
- Final Oral / Written Presentation: 20% (Dec 08)

UPCOMING ASSIGNMENTS:
- Research Paper Final Draft (12 pages on Decolonization) - Due Nov 24 at 11:59pm [35%]
- Final Presentation & Thesis Defense - Due Dec 08 at 2pm [20%]`,
    defaultMilestones: [
      {
        title: 'Research Paper: Decolonization & State-Building',
        type: 'project',
        dueDate: '2026-11-24T23:59',
        weightPercent: 35,
        estimatedPrepHours: 22,
        completedHours: 4,
        difficulty: 'high',
        description: '12-page research paper citing at least 8 primary archival sources and 10 secondary scholarly monographs.',
        status: 'in_progress',
        prepMilestones: [
          { id: 'h1', title: 'Synthesize primary source quotes & outline 4 sections', recommendedHours: 5, daysBeforeDue: 12, completed: true },
          { id: 'h2', title: 'Draft Section I: Colonial Administrative Structures', recommendedHours: 5, daysBeforeDue: 8 },
          { id: 'h3', title: 'Draft Section II & III: Resistance & Independence Movements', recommendedHours: 6, daysBeforeDue: 4 },
          { id: 'h4', title: 'Revise conclusion, format Chicago citations, proofread', recommendedHours: 4, daysBeforeDue: 2 },
        ],
      },
      {
        title: 'Final Presentation & Thesis Defense',
        type: 'presentation',
        dueDate: '2026-12-08T14:00',
        weightPercent: 20,
        estimatedPrepHours: 8,
        completedHours: 0,
        difficulty: 'medium',
        description: '15-minute presentation with visual slide deck defending paper findings, followed by 5-minute Q&A.',
        status: 'upcoming',
        prepMilestones: [
          { id: 'h5', title: 'Create slide deck with historical maps & photographs', recommendedHours: 4, daysBeforeDue: 4 },
          { id: 'h6', title: 'Rehearse delivery with timer and prepare Q&A responses', recommendedHours: 4, daysBeforeDue: 1 },
        ],
      },
    ],
  },
];

// Realistic student commitments (Classes + Campus Job + Gym + Clubs)
export const DEFAULT_COMMITMENTS: WeeklyCommitment[] = [
  // Classes
  { id: 'c-cs189-1', title: 'CS 189 Lecture', category: 'class', dayOfWeek: 1, startTime: '10:00', endTime: '11:30' },
  { id: 'c-cs189-2', title: 'CS 189 Lecture', category: 'class', dayOfWeek: 3, startTime: '10:00', endTime: '11:30' },
  { id: 'c-cs189-3', title: 'CS 189 Discussion', category: 'class', dayOfWeek: 5, startTime: '11:00', endTime: '12:00' },
  { id: 'c-econ-1', title: 'ECON 101 Lecture', category: 'class', dayOfWeek: 2, startTime: '11:00', endTime: '12:30' },
  { id: 'c-econ-2', title: 'ECON 101 Lecture', category: 'class', dayOfWeek: 4, startTime: '11:00', endTime: '12:30' },
  { id: 'c-chem-1', title: 'CHEM 3A Lecture', category: 'class', dayOfWeek: 1, startTime: '13:00', endTime: '14:00' },
  { id: 'c-chem-2', title: 'CHEM 3A Lecture', category: 'class', dayOfWeek: 3, startTime: '13:00', endTime: '14:00' },
  { id: 'c-chem-3', title: 'CHEM 3A Lecture', category: 'class', dayOfWeek: 5, startTime: '13:00', endTime: '14:00' },
  { id: 'c-chem-lab', title: 'CHEM 3A Lab', category: 'class', dayOfWeek: 2, startTime: '14:00', endTime: '17:00' },
  { id: 'c-hist-1', title: 'HIST 102 Seminar', category: 'class', dayOfWeek: 4, startTime: '14:00', endTime: '16:00' },

  // Work & Job Shift
  { id: 'w-1', title: 'Library Student Supervisor Shift', category: 'work', dayOfWeek: 2, startTime: '08:00', endTime: '10:30' },
  { id: 'w-2', title: 'Library Student Supervisor Shift', category: 'work', dayOfWeek: 4, startTime: '08:00', endTime: '10:30' },
  { id: 'w-3', title: 'Weekend Tutoring Shift', category: 'work', dayOfWeek: 6, startTime: '10:00', endTime: '13:00' },

  // Personal / Health / Clubs
  { id: 'p-gym-1', title: 'Gym & Lifting', category: 'personal', dayOfWeek: 1, startTime: '17:30', endTime: '19:00' },
  { id: 'p-gym-2', title: 'Gym & Lifting', category: 'personal', dayOfWeek: 3, startTime: '17:30', endTime: '19:00' },
  { id: 'p-gym-3', title: 'Gym & Lifting', category: 'personal', dayOfWeek: 5, startTime: '17:30', endTime: '19:00' },
  { id: 'p-club', title: 'Robotics Club Meeting', category: 'extracurricular', dayOfWeek: 3, startTime: '19:30', endTime: '21:00' },
];

export function createInitialSemesterData(): {
  courses: Course[];
  milestones: Milestone[];
  commitments: WeeklyCommitment[];
} {
  const courses: Course[] = SAMPLE_SYLLABI.map((s) => ({
    id: s.id,
    code: s.courseCode,
    name: s.courseName,
    instructor: s.instructor,
    color: s.color,
  }));

  const milestones: Milestone[] = [];
  SAMPLE_SYLLABI.forEach((s) => {
    s.defaultMilestones.forEach((m, idx) => {
      milestones.push({
        ...m,
        id: `m-${s.id}-${idx + 1}`,
        courseId: s.id,
      });
    });
  });

  return {
    courses,
    milestones,
    commitments: DEFAULT_COMMITMENTS,
  };
}
