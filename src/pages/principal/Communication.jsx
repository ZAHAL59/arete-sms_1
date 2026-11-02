import { useState } from 'react';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Field, inputCls } from '../../components/ui/Kit';
import { AUDIENCES, CHANNELS, prettyDate } from './constants';

export default function Communication({ p, api }) {
  const [annOpen, setAnnOpen] = useState(false); const [slipOpen, setSlipOpen] = useState(false);
  const [a, setA] = useState({ title: '', msg: '', to: AUDIENCES[0][0], channel: CHANNELS[0] });
  const [q, setQ] = useState({ to: AUDIENCES[0][0], msg: '' }); const [notice, setNotice] = useState('');
  const [slip, setSlip] = useState({ event: '', total: '' });

  function postAnn() { if (!a.title.trim() || !a.msg.trim()) return; api.addAnnouncement({ ...a, title: a.title.trim(), msg: a.msg.trim() }); setAnnOpen(false); setA({ title: '', msg: '', to: AUDIENCES[0][0], channel: CHANNELS[0] }); }
  function message(status) {
    if (!q.msg.trim()) return;
    api.logMessage({ to: q.to, msg: q.msg.trim(), status });
    setNotice(status === 'Draft' ? 'Saved as draft.' : 'Logged as queued — an SMS gateway is not connected yet, so nothing was actually sent.'); setQ(x => ({ ...x, msg: '' }));
  }
  function addSlip() { if (!slip.event.trim() || !+slip.total) return; api.addSlip({ event: slip.event.trim(), total: +slip.total }); setSlipOpen(false); setSlip({ event: '', total: '' }); }
  const staffAud = new Set(AUDIENCES.filter(x => x[1]).map(x => x[0]));

  return (
    <div className="p-6">
      <PageHeader title="Communication" subtitle="Announcements to families and staff — staff announcements also appear in the Teacher portal's Alerts" actions={<Button onClick={() => setAnnOpen(true)}>+ New Announcement</Button>} />
      <Collapsible defaultOpen className="mb-3" header={<div className="flex items-center gap-2"><span className="text-[13.5px] font-bold text-[#111]">Announcements</span><Badge variant="red2">{p.announcements.length}</Badge></div>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">{!p.announcements.length && <div className="p-4 text-[13px] text-[#AAA]">No announcements</div>}{p.announcements.map(x => (
          <div key={x.id} className="flex gap-3 px-4 py-3"><span className="w-2 h-2 rounded-full bg-[#C8202E] mt-1.5" /><div className="flex-1"><div className="text-[13.5px] font-bold text-[#111]">{x.title}</div><div className="text-[13px] text-[#555] mt-0.5">{x.msg}</div>
            <div className="text-[11px] text-[#AAA] mt-1 flex items-center gap-2">Sent {prettyDate(x.sent)} · {x.to} · {x.channel || 'App + SMS'} {staffAud.has(x.to) && <Badge variant="blue">Shown in Teacher alerts</Badge>}</div></div>
            <button onClick={() => api.deleteAnnouncement(x.id)} className="text-[11px] text-[#DC2626] font-semibold cursor-pointer bg-none border-none underline self-start">Delete</button></div>))}</div>
      </Collapsible>

      <Collapsible defaultOpen className="mb-3" header={<span className="text-[13.5px] font-bold text-[#111]">Quick Message</span>}>
        <div className="p-4 border-t border-[#E4E4E4] space-y-3">
          <Field label="To"><select value={q.to} onChange={e => setQ(x => ({ ...x, to: e.target.value }))} className={inputCls}>{AUDIENCES.map(([l]) => <option key={l}>{l}</option>)}</select></Field>
          <Field label="Message"><textarea rows={3} value={q.msg} onChange={e => setQ(x => ({ ...x, msg: e.target.value }))} className={inputCls + ' resize-y'} /></Field>
          <div className="flex gap-2 items-center"><Button variant="outline" onClick={() => message('Draft')}>Save Draft</Button><Button onClick={() => message('Queued')}>📱 Send</Button>{notice && <span className="text-[12px] text-[#B45309]">{notice}</span>}</div>
          {p.messages.length > 0 && <div className="border border-[#E4E4E4] rounded-[8px] divide-y divide-[#E4E4E4] mt-2">{p.messages.slice(0, 6).map(m => <div key={m.id} className="px-3 py-2 text-[12.5px] flex gap-2"><span className="flex-1 text-[#333]"><b>{m.to}:</b> {m.msg}</span><Badge variant={m.status === 'Draft' ? 'grey' : 'amber'}>{m.status}</Badge></div>)}</div>}
        </div>
      </Collapsible>

      <Collapsible defaultOpen header={<div className="flex items-center gap-3 flex-1"><span className="text-[13.5px] font-bold text-[#111]">Permission Slips</span><Button size="sm" variant="outline" className="ml-auto" onClick={e => { e.stopPropagation(); setSlipOpen(true); }}>+ New Slip</Button></div>}>
        <div className="border-t border-[#E4E4E4] divide-y divide-[#E4E4E4]">{p.slips.map(s => (
          <div key={s.id} className="flex items-center gap-3 px-4 py-3"><div className="flex-1"><div className="text-[13px] font-semibold text-[#111]">{s.event}</div>
            <div className="flex items-center gap-2 mt-1"><div className="h-1.5 bg-[#E4E4E4] rounded-full w-32 overflow-hidden"><div className="h-full bg-[#166534] rounded-full" style={{ width: `${s.total ? s.responses / s.total * 100 : 0}%` }} /></div><span className="text-[11.5px] text-[#777]">{s.responses} / {s.total} responses</span></div></div>
            <input type="number" min={0} max={s.total} value={s.responses} onChange={e => api.updateSlip(s.id, { responses: Math.min(s.total, Math.max(0, +e.target.value || 0)) })} className="w-16 px-2 py-1 border border-[#E4E4E4] rounded-[6px] text-[12px] text-center outline-none" title="Update responses received" />
            <button onClick={() => api.updateSlip(s.id, { status: s.status === 'Open' ? 'Closed' : 'Open' })} className="bg-none border-none cursor-pointer"><Badge variant={s.status === 'Open' ? 'green' : 'grey'}>{s.status}</Badge></button></div>))}</div>
      </Collapsible>

      <Modal open={annOpen} onClose={() => setAnnOpen(false)} title="New Announcement" footer={<><Button variant="outline" onClick={() => setAnnOpen(false)}>Cancel</Button><Button onClick={postAnn}>Publish</Button></>}>
        <div className="space-y-3">
          <Field label="Title *"><input value={a.title} onChange={e => setA(x => ({ ...x, title: e.target.value }))} className={inputCls} /></Field>
          <Field label="Message *"><textarea rows={3} value={a.msg} onChange={e => setA(x => ({ ...x, msg: e.target.value }))} className={inputCls + ' resize-y'} /></Field>
          <div className="grid grid-cols-2 gap-3"><Field label="Send To"><select value={a.to} onChange={e => setA(x => ({ ...x, to: e.target.value }))} className={inputCls}>{AUDIENCES.map(([l]) => <option key={l}>{l}</option>)}</select></Field>
            <Field label="Channel"><select value={a.channel} onChange={e => setA(x => ({ ...x, channel: e.target.value }))} className={inputCls}>{CHANNELS.map(c => <option key={c}>{c}</option>)}</select></Field></div>
        </div></Modal>
      <Modal open={slipOpen} onClose={() => setSlipOpen(false)} title="New Permission Slip" footer={<><Button variant="outline" onClick={() => setSlipOpen(false)}>Cancel</Button><Button onClick={addSlip}>Create</Button></>}>
        <div className="space-y-3"><Field label="Event *"><input value={slip.event} onChange={e => setSlip(x => ({ ...x, event: e.target.value }))} placeholder="e.g. Science Fair — Nov 8" className={inputCls} /></Field><Field label="Students invited *"><input type="number" value={slip.total} onChange={e => setSlip(x => ({ ...x, total: e.target.value }))} className={inputCls} /></Field></div></Modal>
    </div>
  );
}
