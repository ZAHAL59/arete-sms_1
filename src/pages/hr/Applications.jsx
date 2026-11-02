import { useState } from 'react';
import { PageHeader } from '../../components/Layout';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Collapsible from '../../components/ui/Collapsible';
import { Field, inputCls } from '../../components/ui/Kit';

const STATUS_VARIANT = { 'Pending Review': 'amber', 'Needs Review': 'amber', Shortlisted: 'green', Rejected: 'red' };
const scoreColor = n => n >= 75 ? '#166534' : n >= 50 ? '#B45309' : '#DC2626';
const dateFmt = iso => iso ? new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function Applications({ hr, shortlist, reject, restore, markInviteSent, initialVac = '' }) {
  const [vac, setVac] = useState(initialVac); const [st, setSt] = useState('');
  const [invite, setInvite] = useState(null); const [msg, setMsg] = useState(''); const [copied, setCopied] = useState(false);
  // An application leaves the inbox once the person has been interviewed or hired — from then on they live under Interviews
  const leftInbox = a => { const c = hr.candidates.find(x => x.appId === a.id); return a.hrStatus === 'Hired' || (!!c && (c.hired || hr.interviews.some(i => i.candId === c.id && i.status === 'Completed'))); };
  const apps = (hr.applications || []).filter(a => !leftInbox(a)).slice().sort((a, b) => (b.appliedAt || '').localeCompare(a.appliedAt || ''));
  const list = apps.filter(a => (!vac || a.vacId === vac) && (!st || a.hrStatus === st));
  const vacancy = id => hr.vacancies.find(v => v.id === id) || { subj: id, qual: '—', exp: '—' };
    const groups = Object.entries(list.reduce((m, a) => ((m[a.vacId] ||= []).push(a), m), {}));

  const inviteText = a => `Dear ${a.name.split(' ')[0]}, you have been shortlisted for ${vacancy(a.vacId).subj} Teacher at Arete Model School. Please attend the interview — the date and time will be communicated shortly. Bring original certificates and photocopies. — HR, Arete Model School`;
  const openInvite = a => { setInvite(a); setMsg(inviteText(a)); setCopied(false); };

  return (
    <div className="p-6">
      <PageHeader title="Applications Inbox" subtitle="Candidates apply via the public careers page · applications arrive here automatically"
        actions={<>
          <select value={vac} onChange={e => setVac(e.target.value)} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]"><option value="">All Vacancies</option>{hr.vacancies.map(v => <option key={v.id} value={v.id}>{v.subj}</option>)}</select>
          <select value={st} onChange={e => setSt(e.target.value)} className="px-2.5 py-1.5 border border-[#E4E4E4] rounded-[6px] text-[12.5px] outline-none focus:border-[#C8202E]"><option value="">All Status</option>{['Pending Review', 'Shortlisted', 'Rejected'].map(s => <option key={s}>{s}</option>)}</select></>} />
      <div className="flex items-center gap-4 bg-[#FEF4F4] border border-[#FECACA] rounded-[10px] px-4 py-3 mb-5">
        <div className="text-[26px]">📥</div>
        <div className="flex-1 text-[12.5px] text-[#555] leading-relaxed"><b className="text-[#9A1822] text-[14px]">Applications arrive here from the public Careers Page</b><br />Candidates visit the careers page, see your posted vacancies, fill in their details and upload their CV. Each submission lands here with an auto-score. HR reviews, shortlists or rejects, then proceeds to interview.</div>
        <a href="/careers" target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#C8202E] text-white text-[12.5px] font-bold rounded-[6px] no-underline whitespace-nowrap">Open Careers Page →</a>
      </div>

      {!list.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] text-center py-16 px-6">
        <div className="text-[40px] mb-3">📭</div><div className="text-[16px] font-bold text-[#555] mb-1">{apps.length ? 'No applications match' : (hr.applications || []).length ? 'Nothing waiting for review' : 'No applications yet'}</div>
        <div className="text-[13.5px] text-[#AAA] mb-5">{apps.length ? 'Try a different vacancy or status.' : (hr.applications || []).length ? 'Interviewed and hired candidates move to the Interviews page.' : 'Post a vacancy and share the careers page link with candidates.'}</div>
</div>}

      {groups.map(([vid, items]) => {
        const v = vacancy(vid); const n = s => items.filter(a => a.hrStatus === s).length;
        return (
          <Collapsible key={vid} defaultOpen className="mb-4" header={
            <div className="flex items-center gap-3 flex-1 flex-wrap"><div><div className="text-[14px] font-bold text-[#111]">{v.subj} Teacher</div><div className="text-[11.5px] text-[#777]">Requires: {v.qual} · {v.exp}</div></div>
              <div className="ml-auto flex gap-1.5"><Badge variant="grey">{items.length} applied</Badge>{n('Pending Review') > 0 && <Badge variant="amber">{n('Pending Review')} pending</Badge>}{n('Shortlisted') > 0 && <Badge variant="green">{n('Shortlisted')} shortlisted</Badge>}{n('Rejected') > 0 && <Badge variant="red">{n('Rejected')} rejected</Badge>}</div></div>}>
            <div className="p-3 space-y-3 border-t border-[#E4E4E4]">{items.map(a => {
              const col = scoreColor(a.score), hasCv = a.cvFileName && a.cvFileName !== 'Not uploaded', pending = ['Pending Review', 'Needs Review'].includes(a.hrStatus);
              return (
                <div key={a.id} className={`rounded-[10px] border p-4 ${a.hrStatus === 'Rejected' ? 'border-[#FECACA] bg-[#FFFAFA] opacity-80' : a.hrStatus === 'Shortlisted' ? 'border-[#E4E4E4] border-l-[3px] border-l-[#C8202E] bg-white' : 'border-[#E4E4E4] bg-white'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-[17px] font-extrabold font-mono flex-shrink-0" style={{ background: col + '18', border: `2.5px solid ${col}`, color: col }} title="Auto-score">{a.score}</div>
                    <div className="flex-1 min-w-0"><div className="text-[14px] font-bold text-[#111]">{a.name}</div><div className="text-[12px] text-[#777] mt-0.5">{a.qual}{a.spec ? ' · ' + a.spec : ''} · {a.exp}</div><div className="text-[11.5px] text-[#AAA] mt-0.5">📞 {a.phone || '—'}{a.email ? ' · ✉ ' + a.email : ''}</div></div>
                    <div className="flex flex-col items-end gap-1.5"><Badge variant={STATUS_VARIANT[a.hrStatus] || 'grey'}>{a.hrStatus}</Badge><span className="text-[10.5px] text-[#AAA]">{dateFmt(a.appliedAt)}</span></div>
                  </div>
                  {hasCv ? <div className="mt-2.5 px-2.5 py-2 bg-[#EFF5FF] text-[#1A5FB4] rounded-[6px] text-[12.5px]">📎 {a.cvFileName}</div> : <div className="mt-2 px-2.5 py-1.5 bg-[#FFFBEB] text-[#B45309] rounded-[6px] text-[12px]">⚠ CV not uploaded — candidate filled the form only</div>}
                  {a.cover && <div className="mt-2 px-3 py-2 bg-[#F8F8F8] rounded-[6px] text-[12.5px] text-[#555] italic leading-relaxed">💬 "{a.cover.slice(0, 160)}{a.cover.length > 160 ? '…' : ''}"</div>}
                  {a.skills && <div className="mt-2 text-[12px] text-[#777]">🎯 {a.skills}</div>}
                  {a.employer && <div className="mt-0.5 text-[12px] text-[#AAA]">🏫 Previously at: {a.employer}</div>}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#E4E4E4]">
                    {pending && <><Button size="sm" onClick={() => shortlist(a.id)}>✓ Shortlist</Button><Button size="sm" variant="outline" onClick={() => reject(a.id)}>✗ Reject</Button></>}
                    {a.hrStatus === 'Shortlisted' && !a.inviteSent && <Button size="sm" variant="outline" onClick={() => openInvite(a)}>📧 Send Interview Invite</Button>}
                    {a.hrStatus === 'Shortlisted' && a.inviteSent && <span className="text-[11.5px] text-[#C8202E] font-semibold">✓ Invite sent · {dateFmt(a.inviteSentAt)}</span>}
                    {a.hrStatus === 'Rejected' && <Button size="sm" variant="outline" onClick={() => restore(a.id)}>↩ Undo Reject</Button>}
                    <span className="ml-auto text-[11px] text-[#AAA] font-mono">Ref: {a.id}</span>
                  </div>
                </div>);
            })}</div>
          </Collapsible>);
      })}

      {invite && <Modal open onClose={() => setInvite(null)} size="lg" title={`Interview invitation — ${invite.name}`} subtitle="Sending is not automatic: copy the message, send it yourself, then mark it as sent"
        footer={<><Button variant="outline" onClick={() => setInvite(null)}>Cancel</Button><Button variant="outline" onClick={() => { navigator.clipboard?.writeText(msg); setCopied(true); }}>{copied ? '✓ Copied' : '📋 Copy message'}</Button><Button onClick={() => { markInviteSent(invite.id, msg); setInvite(null); }}>✓ Mark invite as sent</Button></>}>
        <div className="text-[12px] text-[#777] mb-2">To: <b>{invite.name}</b> · {invite.phone || invite.email || 'no contact on file'}</div>
        <Field label="Message"><textarea rows={5} value={msg} onChange={e => setMsg(e.target.value)} className={inputCls + ' resize-y'} /></Field>
        <div className="text-[11.5px] text-[#AAA] mt-2">Marking it as sent moves the candidate to "Interview Scheduled" and keeps a record of the message.</div></Modal>}
    </div>
  );
}
