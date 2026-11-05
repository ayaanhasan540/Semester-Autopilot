import {
  Milestone,
  WeeklyCommitment,
  StudySession,
  WeekWorkload,
  TriagePlan,
  TriageItem,
  Course,
} from '../types';

// Convert HH:mm to minutes from midnight
export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

// Convert minutes from midnight to HH:mm
export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export interface TimeSlot {
  start: number; // minutes from midnight
  end: number;
}

// Calculate free time slots on a specific date given commitments
export function getFreeTimeSlotsForDay(
  dateStr: string, // YYYY-MM-DD
  commitments: WeeklyCommitment[],
  dayStartMinutes = 8 * 60 + 30, // 08:30 AM
  dayEndMinutes = 22 * 60 + 30 // 10:30 PM
): TimeSlot[] {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay(); // 0 = Sun, 1 = Mon ...

  const dayCommitments = commitments
    .filter((c) => c.dayOfWeek === dayOfWeek)
    .map((c) => ({
      start: timeToMinutes(c.startTime),
      end: timeToMinutes(c.endTime),
    }))
    .sort((a, b) => a.start - b.start);

  // Merge overlapping commitments
  const mergedBusy: TimeSlot[] = [];
  for (const b of dayCommitments) {
    if (mergedBusy.length === 0) {
      mergedBusy.push({ ...b });
    } else {
      const last = mergedBusy[mergedBusy.length - 1];
      if (b.start <= last.end + 10) {
        last.end = Math.max(last.end, b.end);
      } else {
        mergedBusy.push({ ...b });
      }
    }
  }

  // Invert busy into free slots
  const freeSlots: TimeSlot[] = [];
  let current = dayStartMinutes;

  for (const busy of mergedBusy) {
    if (busy.start > current + 30) {
      // At least 30 mins slot
      freeSlots.push({
        start: current,
        end: Math.min(busy.start, dayEndMinutes),
      });
    }
    current = Math.max(current, busy.end + 15); // 15 min buffer after commitment
    if (current >= dayEndMinutes) break;
  }

  if (current + 30 <= dayEndMinutes) {
    freeSlots.push({ start: current, end: dayEndMinutes });
  }

  return freeSlots;
}

// Helper: Format date to YYYY-MM-DD
export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Add days to date
export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return formatDateISO(d);
}

// Get the Monday of the week for a given date
export function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return formatDateISO(d);
}

// Calculate week-by-week workload analysis across the semester
export function calculateSemesterWorkload(
  milestones: Milestone[],
  commitments: WeeklyCommitment[],
  startDate = '2026-10-26', // Week 9 start
  totalWeeks = 8
): WeekWorkload[] {
  const weeks: WeekWorkload[] = [];
  let currentWeekStart = getMondayOfWeek(startDate);

  // Calculate standard weekly free study hours from commitments
  let weeklyFreeHours = 0;
  for (let day = 0; day < 7; day++) {
    // Pick an arbitrary date for that day of week
    const testDate = addDays(currentWeekStart, day);
    const slots = getFreeTimeSlotsForDay(testDate, commitments);
    const dayFreeMins = slots.reduce((acc, s) => acc + (s.end - s.start), 0);
    // Cap practical daily study at 6 hours to prevent burnout
    weeklyFreeHours += Math.min(6, dayFreeMins / 60);
  }
  weeklyFreeHours = Math.round(weeklyFreeHours * 10) / 10;

  for (let w = 1; w <= totalWeeks; w++) {
    const weekStart = currentWeekStart;
    const weekEnd = addDays(weekStart, 6);

    const weekMilestones = milestones.filter((m) => {
      const mDate = m.dueDate.split('T')[0];
      return mDate >= weekStart && mDate <= weekEnd;
    });

    const totalWeight = weekMilestones.reduce((acc, m) => acc + m.weightPercent, 0);
    const totalPrepHours = weekMilestones.reduce((acc, m) => {
      const effectiveHours = Math.max(
        0,
        m.estimatedPrepHours - (m.triageCutHours || 0)
      );
      return acc + effectiveHours;
    }, 0);

    const examCount = weekMilestones.filter(
      (m) => m.type === 'exam' || m.type === 'midterm' || m.type === 'final'
    ).length;
    const projectCount = weekMilestones.filter((m) => m.type === 'project').length;

    let riskLevel: 'safe' | 'moderate' | 'critical' = 'safe';
    let crunchReason: string | undefined;
    let advanceAdvice: string | undefined;

    if (totalPrepHours > weeklyFreeHours * 0.95 || examCount >= 2 || totalWeight >= 35) {
      riskLevel = 'critical';
      crunchReason = `Crunch peak: ${examCount} exams + ${projectCount} project (${totalWeight}% of semester grade) with ${totalPrepHours}h prep required.`;
      advanceAdvice = `High danger of severe fatigue. Frontload ${Math.round(totalPrepHours * 0.4)}h of prep 1 to 2 weeks early to flatten this spike.`;
    } else if (totalPrepHours > weeklyFreeHours * 0.65 || totalWeight >= 20 || examCount === 1) {
      riskLevel = 'moderate';
      crunchReason = `Elevated workload: ${examCount > 0 ? 'Major exam week' : 'Multiple deadlines'} (${totalWeight}% grade weight).`;
      advanceAdvice = `Pace study sessions evenly starting 5-7 days before deadlines.`;
    } else {
      riskLevel = 'safe';
    }

    weeks.push({
      weekNumber: w,
      startDate: weekStart,
      endDate: weekEnd,
      totalPrepHoursNeeded: Math.round(totalPrepHours * 10) / 10,
      freeHoursAvailable: weeklyFreeHours,
      totalGradeWeightDue: Math.round(totalWeight * 10) / 10,
      milestonesDue: weekMilestones,
      riskLevel,
      crunchReason,
      advanceAdvice,
    });

    currentWeekStart = addDays(weekEnd, 1);
  }

  return weeks;
}

// The Autopilot Scheduler: Schedules study sessions into free time windows
export function generateStudySchedule(
  milestones: Milestone[],
  commitments: WeeklyCommitment[],
  existingSessions: StudySession[] = [],
  currentDate = '2026-11-05'
): { sessions: StudySession[]; changesSummary: string[] } {
  // Preserve already completed sessions
  const completedSessions = existingSessions.filter((s) => s.completed);
  const changesSummary: string[] = [];

  // Filter active pending milestones
  const activeMilestones = milestones
    .filter((m) => m.status !== 'completed' && m.status !== 'dropped')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  // Track booked minutes per date
  const bookedMinutesMap = new Map<string, TimeSlot[]>();

  // Pre-seed booked slots with existing completed sessions
  completedSessions.forEach((s) => {
    const list = bookedMinutesMap.get(s.date) || [];
    list.push({
      start: timeToMinutes(s.startTime),
      end: timeToMinutes(s.endTime),
    });
    bookedMinutesMap.set(s.date, list);
  });

  const generatedSessions: StudySession[] = [...completedSessions];
  let newSessionsCount = 0;

  for (const milestone of activeMilestones) {
    const dueDay = milestone.dueDate.split('T')[0];
    if (dueDay < currentDate) continue;

    // Remaining hours needed for this milestone
    const triageCut = milestone.triageCutHours || 0;
    const remainingHours = Math.max(
      0,
      milestone.estimatedPrepHours - milestone.completedHours - triageCut
    );

    if (remainingHours <= 0) continue;

    // Prepare chunks: use decomposed prepMilestones if available, otherwise 2h chunks
    let chunks: { title: string; hours: number; idealDaysBefore: number }[] = [];

    if (milestone.prepMilestones && milestone.prepMilestones.length > 0) {
      chunks = milestone.prepMilestones
        .filter((pm) => !pm.completed)
        .map((pm) => ({
          title: `${milestone.title}: ${pm.title}`,
          hours: pm.recommendedHours,
          idealDaysBefore: pm.daysBeforeDue,
        }));
    }

    if (chunks.length === 0) {
      let hoursLeft = remainingHours;
      let chunkIdx = 1;
      while (hoursLeft > 0) {
        const chunkHours = Math.min(2.5, hoursLeft);
        chunks.push({
          title: `${milestone.title} - Prep Part ${chunkIdx}`,
          hours: chunkHours,
          idealDaysBefore: Math.max(1, chunkIdx * 2),
        });
        hoursLeft -= chunkHours;
        chunkIdx++;
      }
    }

    // Schedule each chunk into an available free slot before the due date
    for (const chunk of chunks) {
      let targetDate = addDays(dueDay, -chunk.idealDaysBefore);
      if (targetDate < currentDate) {
        targetDate = currentDate;
      }

      const neededDurationMins = Math.round(chunk.hours * 60);
      let scheduled = false;

      // Search up to 10 days starting from targetDate
      for (let offset = 0; offset <= 10; offset++) {
        const candidateDate = addDays(targetDate, offset);
        if (candidateDate > dueDay) break; // cannot study after due date

        const freeSlots = getFreeTimeSlotsForDay(candidateDate, commitments);
        const booked = bookedMinutesMap.get(candidateDate) || [];

        // Check each free slot
        for (const slot of freeSlots) {
          // Find open sub-interval in slot that doesn't conflict with booked
          let slotCurrent = slot.start;

          while (slotCurrent + 45 <= slot.end) {
            const potentialEnd = Math.min(slotCurrent + neededDurationMins, slot.end);

            // Check if potentialEnd - slotCurrent is at least 45 mins
            if (potentialEnd - slotCurrent >= 45) {
              // Check collision with already booked sessions
              const hasCollision = booked.some(
                (b) =>
                  Math.max(slotCurrent, b.start) < Math.min(potentialEnd, b.end)
              );

              if (!hasCollision) {
                // Book it!
                const session: StudySession = {
                  id: `ses-${milestone.id}-${generatedSessions.length + 1}-${candidateDate}`,
                  milestoneId: milestone.id,
                  courseId: milestone.courseId,
                  title: chunk.title,
                  date: candidateDate,
                  startTime: minutesToTime(slotCurrent),
                  endTime: minutesToTime(potentialEnd),
                  durationMinutes: potentialEnd - slotCurrent,
                  completed: false,
                  skipped: false,
                  notes: `${milestone.weightPercent}% grade weight · ${milestone.difficulty} priority`,
                };

                generatedSessions.push(session);
                booked.push({ start: slotCurrent, end: potentialEnd });
                bookedMinutesMap.set(candidateDate, booked);

                scheduled = true;
                newSessionsCount++;
                break;
              }
            }

            slotCurrent += 30; // step forward
          }

          if (scheduled) break;
        }

        if (scheduled) break;
      }
    }
  }

  // Sort chronologically
  generatedSessions.sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  if (newSessionsCount > 0) {
    changesSummary.push(
      `Autopilot optimized schedule: ${newSessionsCount} study sessions scheduled around your weekly commitments.`
    );
  }

  return { sessions: generatedSessions, changesSummary };
}

// Smart Reshuffle Triggered by: Skipping a session, changing due date, or manually clicking Reshuffle
export function reshuffleStudyPlan(
  milestones: Milestone[],
  commitments: WeeklyCommitment[],
  existingSessions: StudySession[],
  currentDate = '2026-11-05',
  reason?: string
): { sessions: StudySession[]; changesSummary: string[] } {
  // Discard future uncompleted sessions and re-generate
  const pastOrCompleted = existingSessions.filter(
    (s) => s.completed || (s.date < currentDate && !s.skipped)
  );

  const { sessions, changesSummary } = generateStudySchedule(
    milestones,
    commitments,
    pastOrCompleted,
    currentDate
  );

  const finalSummary = [
    reason ? `Reshuffled: ${reason}` : 'Reshuffled upcoming study blocks.',
    ...changesSummary,
  ];

  return { sessions, changesSummary: finalSummary };
}

// Grade Triage Engine: Calculates exactly what to cut/trim when time is insufficient
export function calculateGradeTriage(
  milestones: Milestone[],
  courses: Course[],
  availableHours: number,
  neededHours: number
): TriagePlan {
  const deficitHours = Math.max(0, neededHours - availableHours);
  const courseMap = new Map(courses.map((c) => [c.id, c]));

  // Active items
  const activeItems = milestones.filter(
    (m) => m.status !== 'completed' && m.status !== 'dropped'
  );

  const triageItems: TriageItem[] = activeItems.map((m) => {
    const course = courseMap.get(m.courseId);
    const hours = Math.max(1, m.estimatedPrepHours - m.completedHours);
    const weight = Math.max(1, m.weightPercent);
    // Grade Efficiency: Hours saved per 1% grade lost
    // Higher ratio means you save more time for every 1% of grade you risk -> prime candidate to trim or drop!
    const ratio = hours / weight;

    let suggestedAction: 'protect' | 'trim' | 'drop' = 'protect';
    let newHours = hours;
    let hoursSaved = 0;
    let gradeRisk = 'None (Full Prep)';
    let rationale = '';

    if (weight <= 5 && ratio >= 1.0) {
      // Small assignments / readings that eat up a lot of hours
      suggestedAction = 'drop';
      newHours = 0;
      hoursSaved = hours;
      gradeRisk = `Max -${weight}% course grade penalty`;
      rationale = `Low weight (${weight}%), high time cost (${hours}h). Dropping this frees ${hours} hours to guarantee top performance on high-stakes exams.`;
    } else if (weight >= 15 && weight <= 25) {
      // Big exams / projects: Apply 80/20 trim if deficit is high
      if (deficitHours > 8) {
        suggestedAction = 'trim';
        newHours = Math.round(hours * 0.65 * 10) / 10;
        hoursSaved = Math.round((hours - newHours) * 10) / 10;
        gradeRisk = `~2-4% risk (B+/A- tier instead of 100%)`;
        rationale = `Pareto 80/20 Principle: Focusing on high-yield exam topics and formula drills gets 85-90% of points with 65% of study hours, saving ${hoursSaved}h.`;
      } else {
        suggestedAction = 'protect';
        newHours = hours;
        hoursSaved = 0;
        gradeRisk = '0% (Protected)';
        rationale = `Critical milestone (${weight}% of final grade). Must NOT be sacrificed; dropping prep here causes full letter grade drops.`;
      }
    } else if (weight > 25) {
      // Final exam or massive project
      suggestedAction = 'protect';
      newHours = hours;
      hoursSaved = 0;
      gradeRisk = '0% (Protected)';
      rationale = `Highest stakes milestone (${weight}% of grade). Fully protected by Autopilot.`;
    } else {
      // Intermediate projects/papers
      suggestedAction = 'trim';
      newHours = Math.round(hours * 0.7 * 10) / 10;
      hoursSaved = Math.round((hours - newHours) * 10) / 10;
      gradeRisk = `~1-2% point variance`;
      rationale = `Trim secondary polish and formatting to focus strictly on core rubric requirements.`;
    }

    return {
      milestoneId: m.id,
      milestoneTitle: m.title,
      courseCode: course ? course.code : 'Course',
      currentPrepHours: hours,
      weightPercent: weight,
      hoursPerWeightPoint: Math.round(ratio * 10) / 10,
      suggestedAction,
      newPrepHours: newHours,
      hoursSaved,
      gradeRisk,
      rationale,
    };
  });

  // Sort by hoursPerWeightPoint descending so best triage candidates appear first
  triageItems.sort((a, b) => b.hoursPerWeightPoint - a.hoursPerWeightPoint);

  const totalHoursSaved = triageItems.reduce((acc, item) => acc + item.hoursSaved, 0);

  return {
    deficitHours,
    items: triageItems,
    totalHoursSaved: Math.round(totalHoursSaved * 10) / 10,
    aiVerdict:
      deficitHours > 0
        ? `You face a ${deficitHours.toFixed(1)}h study deficit. Autopilot identified ${totalHoursSaved.toFixed(1)}h in strategic trims and low-impact drops that protect 96%+ of your cumulative GPA.`
        : 'Your schedule has adequate capacity, but you can preview triage recommendations anytime if an emergency arises.',
  };
}
