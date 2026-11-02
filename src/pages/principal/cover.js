// Substitute-cover helpers. A class timetable cell is "Subject|Teacher Name"; columns are Mon–Fri.
export const colOf = date => { const d = new Date(date + 'T00:00:00').getDay(); return d >= 1 && d <= 5 ? d - 1 : -1; };

// The periods a teacher is scheduled to teach on a given date
export function periodsFor(timetable, name, date) {
  const col = colOf(date); if (col < 0) return [];
  const out = [];
  Object.entries(timetable).forEach(([cls, tt]) => tt.slots.forEach((r, row) => {
    const c = r.cells[col]; if (!c || c === 'BREAK') return;
    const [subject, teacher] = c.split('|'); if (teacher === name) out.push({ cls, row, time: r.time, subject });
  }));
  return out.sort((a, b) => a.row - b.row || a.cls.localeCompare(b.cls));
}

// Everyone named on the timetable or in the staff list
export const allTeachers = (timetable, staff) => [...new Set([...staff.map(s => s.name), ...Object.values(timetable).flatMap(t => t.slots.flatMap(r => r.cells.map(c => c.split('|')[1]).filter(Boolean)))])].sort();

// Teachers who teach in this period slot on that weekday
export function teachingAt(timetable, row, date) {
  const col = colOf(date), set = new Set();
  Object.values(timetable).forEach(tt => { const c = tt.slots[row]?.cells[col]; if (c && c !== 'BREAK') { const t = c.split('|')[1]; if (t) set.add(t); } });
  return set;
}

// Periods still without a substitute for one absent teacher on one date
export const uncovered = (timetable, subs, name, date) => periodsFor(timetable, name, date).filter(per => !subs.some(x => x.date === date && x.absent === name && x.cls === per.cls && x.row === per.row && x.sub));
