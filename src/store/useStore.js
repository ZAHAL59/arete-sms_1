import { create } from 'zustand';
import { loadDB, saveDB } from '../data/db';

const TEACHER_KEY = 'ARETE_TEACHER_T001';
const SESSION_KEY = 'ARETE_TEACHER_SESSIONS';

function loadTeacherLocal() {
  try { return JSON.parse(localStorage.getItem(TEACHER_KEY) || '{}'); } catch { return {}; }
}
function saveTeacherLocal(data) {
  try { localStorage.setItem(TEACHER_KEY, JSON.stringify(data)); } catch {}
}

const useStore = create((set, get) => {
  const teacherLocal = loadTeacherLocal();
  return {
    db: loadDB(),
    // Attendance log: { 'Grade8A-2026-10-28': { S001:'P', S002:'A' } }
    attLog: teacherLocal.attLog || {},
    // Absence notes: { 'Grade8A-2026-10-28-S001': { reason, extra } }
    absNotes: teacherLocal.absNotes || {},
    // Private teacher notes
    myNotes: teacherLocal.myNotes || [],
    // Session logs (all teachers share via db)
    sessionLogs: (() => { try { return JSON.parse(localStorage.getItem(SESSION_KEY)||'[]'); } catch { return []; } })(),

    // ── DB updates ───────────────────────────────────────────
    updateDB: (fn) => {
      const db = fn(structuredClone(get().db));
      saveDB(db);
      set({ db });
    },

    // ── Attendance ───────────────────────────────────────────
    markStudent: (cls, date, stuId, status) => {
      const key = cls.replace(/\s+/g,'') + '-' + date;
      const attLog = { ...get().attLog };
      if (!attLog[key]) attLog[key] = {};
      attLog[key] = { ...attLog[key], [stuId]: status };
      const teacherData = { attLog, absNotes: get().absNotes, myNotes: get().myNotes };
      saveTeacherLocal(teacherData);
      set({ attLog });
    },

    saveAttendance: (cls, date) => {
      const key = cls.replace(/\s+/g,'') + '-' + date;
      const log = get().attLog[key] || {};
      // Also sync to shared db
      get().updateDB(db => {
        if (!db.attendance) db.attendance = {};
        db.attendance[key] = log;
        return db;
      });
    },

    setAbsNote: (cls, date, stuId, reason, extra) => {
      const noteKey = cls.replace(/\s+/g,'') + '-' + date + '-' + stuId;
      const absNotes = { ...get().absNotes, [noteKey]: { reason, extra } };
      const teacherData = { attLog: get().attLog, absNotes, myNotes: get().myNotes };
      saveTeacherLocal(teacherData);
      set({ absNotes });
    },

    editAttendance: (attKey, stuId, status, reason, extra) => {
      const attLog = structuredClone(get().attLog);
      if (!attLog[attKey]) attLog[attKey] = {};
      attLog[attKey][stuId] = status;
      const noteKey = attKey + '-' + stuId;
      const absNotes = { ...get().absNotes, [noteKey]: { reason: '[Edited] ' + reason, extra } };
      const teacherData = { attLog, absNotes, myNotes: get().myNotes };
      saveTeacherLocal(teacherData);
      set({ attLog, absNotes });
    },

    // ── Session logs ─────────────────────────────────────────
    addSessionLog: (log) => {
      const sessionLogs = [log, ...get().sessionLogs];
      try { localStorage.setItem(SESSION_KEY, JSON.stringify(sessionLogs)); } catch {}
      // Also add as milestone on student
      get().updateDB(db => {
        const s = db.students.find(x => x.id === log.stuId);
        if (s) {
          if (!s.milestones) s.milestones = [];
          s.milestones.push({ date: log.date, text: `[${log.type}] ${log.topic} — ${log.observation.slice(0,80)}` });
        }
        return db;
      });
      set({ sessionLogs });
    },

    // ── Notes ────────────────────────────────────────────────
    addNote: (note) => {
      const myNotes = [note, ...get().myNotes];
      const teacherData = { attLog: get().attLog, absNotes: get().absNotes, myNotes };
      saveTeacherLocal(teacherData);
      set({ myNotes });
    },
    deleteNote: (id) => {
      const myNotes = get().myNotes.filter(n => n.id !== id);
      const teacherData = { attLog: get().attLog, absNotes: get().absNotes, myNotes };
      saveTeacherLocal(teacherData);
      set({ myNotes });
    },
  };
});

export default useStore;
