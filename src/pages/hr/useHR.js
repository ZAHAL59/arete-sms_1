import { useState, useCallback } from 'react';
import { loadHR, saveHR } from './constants';
import useStore from '../../store/useStore';

export default function useHR() {
  const [hr, setHR] = useState(loadHR);
  const updateDB = useStore(s => s.updateDB);

  const update = useCallback((fn) => {
    setHR(prev => {
      const next = fn(JSON.parse(JSON.stringify(prev)));
      saveHR(next);
      return next;
    });
  }, []);

  return {
    hr,
    addVacancy:    (v)       => update(d => { d.vacancies.push({...v, count: Math.max(1, parseInt(v.count) || 1), id:'V'+String(d.vacancies.length+1).padStart(3,'0'), posted:new Date().toISOString().slice(0,10), status:'Active'}); return d; }),
    updateVacancy: (id, f)   => update(d => { const i=d.vacancies.findIndex(x=>x.id===id); if(i>=0) d.vacancies[i]={...d.vacancies[i],...f}; return d; }),
    addCandidate:  (c)       => update(d => { d.candidates.push({...c, id:'C'+String(d.candidates.length+1).padStart(3,'0'), status:'Shortlisted'}); return d; }),
    updateCandidate:(id,f)   => update(d => { const i=d.candidates.findIndex(x=>x.id===id); if(i>=0) d.candidates[i]={...d.candidates[i],...f}; return d; }),
    scheduleInterview:(intvw)=> update(d => {
      const c = d.candidates.find(x => x.id === intvw.candId);
      const ex = d.interviews.find(x => x.candId === intvw.candId && x.status === 'Scheduled');
      if (ex) Object.assign(ex, { date: intvw.date, time: intvw.time, venue: intvw.venue, mode: intvw.mode, panel: intvw.panel ?? ex.panel });            // reschedule
      else d.interviews.push({ ...intvw, vacId: intvw.vacId || c?.vacId, id:'I'+Date.now().toString().slice(-6), status:'Scheduled', scores:{}, remarks:'', decision:'' });
      if (c && ['Shortlisted','Pending','Interview Scheduled'].includes(c.status)) c.status = 'Interview Scheduled';
      return d;
    }),
    updateInterview:(id,f)   => update(d => { const i=d.interviews.findIndex(x=>x.id===id); if(i>=0) d.interviews[i]={...d.interviews[i],...f}; return d; }),
    addTraining:   (t)       => update(d => { d.training.push({...t, id:'TR'+String(d.training.length+1).padStart(3,'0'), attendance:{}, status:'Upcoming'}); return d; }),
    markTrainingAtt:(tId,sId,status) => update(d => { const t=d.training.find(x=>x.id===tId); if(t) t.attendance[sId]=status; return d; }),
    updateLeave:   (id,status) => update(d => { const l=d.leaveRequests.find(x=>x.id===id); if(l) l.status=status; return d; }),
    addLeave:      (l)       => update(d => { d.leaveRequests.push({...l, id:'LR'+String(d.leaveRequests.length+1).padStart(3,'0'), status:'Pending'}); return d; }),
    // HR copies the invitation, sends it, then records that it was sent
    markInviteSent: (appId, msg) => update(d => {
      const a = (d.applications || []).find(x => x.id === appId); if (!a) return d;
      a.inviteSent = true; a.inviteSentAt = new Date().toISOString();
      const c = d.candidates.find(x => x.appId === appId); if (c && ['Shortlisted', 'Pending'].includes(c.status)) c.status = 'Interview Scheduled';
      (d.notifications ||= []).push({ id: 'N' + Date.now().toString().slice(-6), type: 'interview_invite', to: a.name, contact: a.phone || a.email || '—', msg, sentAt: a.inviteSentAt, appId });
      return d;
    }),
    shortlistApplication: (id) => update(d => {
      const a = (d.applications || []).find(x => x.id === id); if (!a) return d;
      let c = d.candidates.find(x => x.appId === id);
      if (c) c.status = 'Shortlisted';
      else d.candidates.push({ id:'C'+String(d.candidates.length+1).padStart(3,'0'), appId:id, vacId:a.vacId, name:a.name,
        qual: a.qual + (a.spec ? ', ' + a.spec : ''), exp:a.exp, contact:a.phone || a.email, score:a.score, status:'Shortlisted',
        notes:(a.cover || '').slice(0, 120) });
      a.hrStatus = 'Shortlisted'; return d;
    }),
    rejectApplication: (id) => update(d => {
      const a = (d.applications || []).find(x => x.id === id); if (!a) return d;
      a.hrStatus = 'Rejected'; const c = d.candidates.find(x => x.appId === id); if (c) c.status = 'Rejected'; return d;
    }),
    restoreApplication: (id) => update(d => {
      const a = (d.applications || []).find(x => x.id === id); if (!a) return d;
      const c = d.candidates.find(x => x.appId === id);
      if (c) { c.status = 'Shortlisted'; a.hrStatus = 'Shortlisted'; } else a.hrStatus = 'Pending Review'; return d;
    }),
    setChecklist: (list) => update(d => { d.checklist = list; return d; }),
    saveInterviewResult: (id, candId, data) => update(d => {
      const c = d.candidates.find(x => x.id === candId);
      const rec = { ...(d.interviews.find(x => x.id === id) || {}), ...data, id: id || 'I' + String(d.interviews.length + 1).padStart(3, '0'), candId, vacId: c ? c.vacId : null, status: 'Completed' };
      const i = d.interviews.findIndex(x => x.id === rec.id); if (i >= 0) d.interviews[i] = rec; else d.interviews.push(rec);
      if (c) c.status = data.decision === 'Recommended' ? 'Recommended' : data.decision === 'Rejected' ? 'Rejected' : 'Interview Done';
      return d;
    }),
    hireCandidate: (candId, h) => {
      let staffId = null;
      updateDB(db => { staffId = 'T' + String(db.staff.length + 1).padStart(3, '0');
        db.staff.push({ id: staffId, name: h.name, subj: h.post, dept: h.dept, joined: h.joinDate, phone: h.phone, email: h.email, salary: h.salary, status: 'Active', classes: [], hiredFrom: 'Recruitment · ' + candId }); return db; });
      update(d => {
        const c = d.candidates.find(x => x.id === candId); if (!c) return d;
        const app = (d.applications || []).find(x => x.id === c.appId); if (app) app.hrStatus = 'Hired';
        c.status = 'Hired'; c.hired = true; c.hiredAs = { staffId, post: h.post, salary: h.salary, joinDate: h.joinDate };
        c.offerLetter = { name: c.name, post: h.post, dept: h.dept, salary: h.salary, joinDate: h.joinDate, phone: h.phone, email: h.email, vacId: c.vacId,
          refNo: 'AMS/HR/OL/' + new Date().getFullYear() + '/' + String(Date.now()).slice(-4), issuedDate: new Date().toISOString().slice(0, 10) };
        const v = d.vacancies.find(x => x.id === c.vacId);
        if (v && d.candidates.filter(x => x.vacId === v.id && x.hired).length >= (v.count || 1)) v.status = 'Filled';
        return d;
      });
    },
    addStaffDoc: (x) => update(d => { (d.staffDocs ||= []).unshift({ ...x, id: 'SD' + Date.now().toString().slice(-6) }); return d; }),
    deleteStaffDoc: (id) => update(d => { d.staffDocs = (d.staffDocs || []).filter(x => x.id !== id); return d; }),
    markStaffAtt:  (staffId,month,day,status) => update(d => { const k=staffId+'-'+month; if(!d.staffAtt[k])d.staffAtt[k]={}; d.staffAtt[k][day]=status; return d; }),
  };
}
