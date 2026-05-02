const isoDate = (d) => d.toISOString().split('T')[0];

const safeDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

export const calendarService = {
  buildEvents({ user, assignments = [], exams = [], timetable = {}, announcements = [] } = {}) {
    const events = [];

    // Assignments due
    for (const a of assignments) {
      if (!a?.dueDate) continue;
      if (user?.class && a.class && a.class !== user.class) continue;
      events.push({
        id: `evt-asgn-${a.id}`,
        type: 'assignment',
        date: a.dueDate,
        title: a.title,
        meta: { assignmentId: a.id, subject: a.subject, class: a.class },
      });
    }

    // Exams
    for (const e of exams) {
      if (!e?.date) continue;
      if (user?.role === 'student' && e.class && user?.class && e.class !== user.class) continue;
      events.push({
        id: `evt-exam-${e.id}`,
        type: 'exam',
        date: e.date,
        title: e.name || 'Exam',
        meta: { examId: e.id, subject: e.subject, class: e.class },
      });
    }

    // Announcements (optional date field)
    for (const a of announcements) {
      if (!a?.date) continue;
      events.push({
        id: `evt-ann-${a.id}`,
        type: 'event',
        date: a.date,
        title: a.title || 'Announcement',
        meta: { announcementId: a.id, priority: a.priority },
      });
    }

    // Timetable: create events for the next 31 days for dots + “next class”
    try {
      const today = startOfDay(new Date());
      for (let i = 0; i < 31; i++) {
        const day = new Date(today);
        day.setDate(day.getDate() + i);
        const weekday = day.toLocaleDateString('en-US', { weekday: 'long' });
        const slots = timetable?.[user?.class]?.find((t) => t.day === weekday)?.slots || [];
        if (slots.length === 0) continue;

        events.push({
          id: `evt-tt-${user?.class}-${isoDate(day)}`,
          type: 'class',
          date: isoDate(day),
          title: 'Classes',
          meta: { class: user?.class, slotsCount: slots.length, slots },
        });
      }
    } catch {
      // ignore locale/date issues
    }

    // Sort by date ascending (string date ok if YYYY-MM-DD)
    return events
      .filter((e) => !!safeDate(e.date))
      .sort((a, b) => safeDate(a.date) - safeDate(b.date));
  },

  nextUpcoming({ events = [], now = new Date(), limit = 3 } = {}) {
    const base = startOfDay(now);
    const upcoming = events.filter((e) => safeDate(e.date) >= base);
    return upcoming.slice(0, limit);
  },
};

