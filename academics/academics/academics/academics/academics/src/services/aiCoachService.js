const daysBetween = (a, b) => {
  const ms = 24 * 60 * 60 * 1000;
  const da = new Date(a);
  const db = new Date(b);
  return Math.round((db - da) / ms);
};

export const aiCoachService = {
  buildCoach({ user, subjectHealthData = [], pendingAssignments = [], upcomingEvents = [], attendanceRate = 0, attempts = [] } = {}) {
    const plan = [];
    const now = new Date();

    const weakest = (subjectHealthData || []).slice().sort((x, y) => (x.score ?? 0) - (y.score ?? 0))[0];
    const nextExam = (upcomingEvents || []).find((e) => e.type === 'exam');
    const nextAsgn = (upcomingEvents || []).find((e) => e.type === 'assignment');

    if (pendingAssignments.length > 0) {
      const top = pendingAssignments
        .slice()
        .sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))[0];
      plan.push({
        title: `Submit: ${top.title}`,
        reason: top.dueDate ? `Due on ${top.dueDate}. Clearing this reduces deadline stress.` : 'Clear your next pending assignment.',
        cta: { label: 'Open assignments', to: '/student/assignments' },
        priority: 'high',
      });
    }

    if (nextExam?.date) {
      const d = daysBetween(now, nextExam.date);
      plan.push({
        title: d <= 7 ? `Exam soon: ${nextExam.title}` : `Prepare for: ${nextExam.title}`,
        reason: d <= 0 ? 'It’s today. Do a 20-minute quick revision + practice.' : `${d} day(s) remaining. Do a focused mock + review mistakes.`,
        cta: { label: 'Go to Exam Center', to: '/student/exams' },
        priority: d <= 7 ? 'high' : 'med',
      });
    }

    if (weakest?.subject) {
      const recentAttempts = (attempts || []).filter((a) => a.subject === weakest.subject).slice(0, 3);
      const attemptHint =
        recentAttempts.length === 0 ? 'No recent mocks logged — start one to benchmark.' : 'You have recent mocks — review wrong answers and retry.';
      plan.push({
        title: `Boost ${weakest.subject}`,
        reason: `Your current health score is ${weakest.score}%. ${attemptHint}`,
        cta: { label: 'Practice mocks', to: '/student/exams' },
        priority: 'med',
      });
    }

    if (attendanceRate < 75) {
      plan.push({
        title: 'Fix attendance',
        reason: `Attendance is ${attendanceRate}%. Improve consistency to avoid grade impact.`,
        cta: { label: 'View attendance', to: '/student/attendance' },
        priority: 'med',
      });
    }

    // If nothing else, keep it encouraging but specific.
    const tip =
      plan[0]?.reason ||
      (weakest?.subject
        ? `Focus on ${weakest.subject} today. Even 30 minutes of practice can lift your score.`
        : 'You’re in good shape. Keep a steady daily revision habit.');

    return { tip, plan: plan.slice(0, 4) };
  },
};

