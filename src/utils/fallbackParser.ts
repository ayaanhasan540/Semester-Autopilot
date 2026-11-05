import { Course, Milestone } from '../types';

export function parseSyllabusClientFallback(rawText: string): {
  course: Course;
  milestones: Milestone[];
} {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

  // Detect course code
  const codeMatch = rawText.match(/\b([A-Z]{2,5}\s*\d{1,4}[A-Za-z]?)\b/);
  const courseCode = codeMatch ? codeMatch[1].toUpperCase() : 'COURSE 101';

  // Detect course title
  let courseName = 'Uploaded Course';
  for (const line of lines.slice(0, 5)) {
    if (line.includes(':') && line.length < 80) {
      courseName = line.split(':')[1].trim();
      break;
    }
  }

  const courseId = `c-client-${Date.now()}`;
  const course: Course = {
    id: courseId,
    code: courseCode,
    name: courseName,
    instructor: 'Course Instructor',
    color: 'emerald',
  };

  const milestones: Milestone[] = [];
  const patterns = [
    { type: 'midterm' as const, regex: /midterm\s*(\d*)[^:\n]*[:\-–]?\s*([^\n\d]*?)(\d{1,2})%/i },
    { type: 'final' as const, regex: /final\s*(exam|project)?[^:\n]*[:\-–]?\s*([^\n\d]*?)(\d{1,2})%/i },
    { type: 'assignment' as const, regex: /(homework|problem set|hw|assignment)\s*(\d*)[^:\n]*[:\-–]?\s*([^\n\d]*?)(\d{1,2})%/i },
    { type: 'project' as const, regex: /project[^:\n]*[:\-–]?\s*([^\n\d]*?)(\d{1,2})%/i },
    { type: 'quiz' as const, regex: /quiz(zes)?[^:\n]*[:\-–]?\s*([^\n\d]*?)(\d{1,2})%/i },
  ];

  let mCount = 1;
  for (const line of lines) {
    for (const pat of patterns) {
      const match = line.match(pat.regex);
      if (match) {
        const weight = parseInt(match[match.length - 1], 10) || 15;
        milestones.push({
          id: `m-${courseId}-${mCount++}`,
          courseId,
          title: line.split(/[:–-]/)[0].trim() || `${courseCode} ${pat.type}`,
          type: pat.type,
          dueDate: '2026-11-20T23:59',
          weightPercent: Math.min(50, Math.max(5, weight)),
          estimatedPrepHours: pat.type === 'midterm' || pat.type === 'final' ? 14 : 6,
          completedHours: 0,
          difficulty: pat.type === 'midterm' || pat.type === 'final' ? 'high' : 'medium',
          description: line,
          status: 'upcoming',
          prepMilestones: [
            {
              id: `p-${courseId}-${mCount}-1`,
              title: `Concept review and lecture notes`,
              recommendedHours: 3,
              daysBeforeDue: 5,
            },
            {
              id: `p-${courseId}-${mCount}-2`,
              title: `Practice problems and final review`,
              recommendedHours: 3,
              daysBeforeDue: 1,
            },
          ],
        });
        break;
      }
    }
  }

  // If no patterns matched, provide realistic default structure based on standard course
  if (milestones.length === 0) {
    milestones.push(
      {
        id: `m-${courseId}-1`,
        courseId,
        title: `${courseCode} Midterm Exam`,
        type: 'midterm',
        dueDate: '2026-11-18T19:00',
        weightPercent: 25,
        estimatedPrepHours: 14,
        completedHours: 0,
        difficulty: 'high',
        description: 'Comprehensive midterm evaluation',
        status: 'upcoming',
        prepMilestones: [
          { id: `p-${courseId}-1-1`, title: 'Lecture slides & formula review', recommendedHours: 5, daysBeforeDue: 6 },
          { id: `p-${courseId}-1-2`, title: 'Practice problems & past exam drills', recommendedHours: 5, daysBeforeDue: 3 },
          { id: `p-${courseId}-1-3`, title: 'Timed mock exam simulation', recommendedHours: 4, daysBeforeDue: 1 },
        ],
      },
      {
        id: `m-${courseId}-2`,
        courseId,
        title: `${courseCode} Problem Set 4`,
        type: 'assignment',
        dueDate: '2026-11-25T23:59',
        weightPercent: 10,
        estimatedPrepHours: 6,
        completedHours: 0,
        difficulty: 'medium',
        description: 'Analytical problem set',
        status: 'upcoming',
        prepMilestones: [
          { id: `p-${courseId}-2-1`, title: 'Solve analytical questions', recommendedHours: 3, daysBeforeDue: 3 },
          { id: `p-${courseId}-2-2`, title: 'Verify proofs & final format check', recommendedHours: 3, daysBeforeDue: 1 },
        ],
      },
      {
        id: `m-${courseId}-3`,
        courseId,
        title: `${courseCode} Final Examination`,
        type: 'final',
        dueDate: '2026-12-15T09:00',
        weightPercent: 35,
        estimatedPrepHours: 18,
        completedHours: 0,
        difficulty: 'high',
        description: 'Cumulative final exam',
        status: 'upcoming',
        prepMilestones: [
          { id: `p-${courseId}-3-1`, title: 'Comprehensive concept synthesis', recommendedHours: 6, daysBeforeDue: 8 },
          { id: `p-${courseId}-3-2`, title: 'Walkthrough previous final exams', recommendedHours: 8, daysBeforeDue: 4 },
          { id: `p-${courseId}-3-3`, title: 'High-yield formula drill', recommendedHours: 4, daysBeforeDue: 1 },
        ],
      }
    );
  }

  return { course, milestones };
}
