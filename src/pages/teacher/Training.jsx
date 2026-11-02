import { PageHeader } from '../../components/Layout';
import Collapsible from '../../components/ui/Collapsible';
import Badge from '../../components/ui/Badge';
import { getMyTraining, TODAY } from './constants';

export default function Training() {
  const sessions = getMyTraining();
  return (
    <div className="p-6">
      <PageHeader title="Training Sessions" subtitle={`${sessions.length} session(s) you are invited to — scheduled by HR`} />
      {!sessions.length && <div className="bg-white border border-[#E4E4E4] rounded-[10px] p-12 text-center text-[#AAA]">No training sessions</div>}
      <div className="space-y-2">{sessions.map(t => {
        const isPast = t.date < TODAY; const status = t.myStatus === 'present' ? ['Attended', 'green'] : t.myStatus === 'absent' ? ['Absent', 'red'] : isPast ? ['Not recorded', 'grey'] : ['Upcoming', 'blue'];
        return (
          <Collapsible key={t.id} header={
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center text-[16px] flex-shrink-0 ${isPast ? 'bg-[#F0FDF4]' : 'bg-[#FEF4F4]'}`}>{isPast ? '✅' : '📅'}</div>
              <div className="flex-1"><div className="text-[13.5px] font-bold text-[#111]">{t.title}</div><div className="text-[11.5px] text-[#AAA] mt-0.5">{t.date}{t.time ? ' · ' + t.time : ''} · {t.duration} · {t.trainer || '—'}</div></div>
              <Badge variant={status[1]}>{status[0]}</Badge>
            </div>}>
            <div className="px-4 py-3 border-t border-[#E4E4E4] space-y-2">
              {(t.topics || []).length > 0 && <><div className="text-[10.5px] font-bold text-[#AAA] uppercase tracking-wider">Topics</div><div className="flex gap-2 flex-wrap">{t.topics.map(tp => <Badge key={tp} variant="purple">{tp}</Badge>)}</div></>}
              <div className="text-[12.5px] text-[#555]">{t.mode && t.mode !== 'In-person' ? <>Online via <b>{t.platform}</b>{t.link && <> · <a href={t.link} target="_blank" rel="noreferrer" className="text-[#C8202E] underline">Join link</a></>}{t.meetingId && <> · ID {t.meetingId}</>}{t.passcode && <> · Passcode {t.passcode}</>}</> : <>Venue: <b>{t.venue || 'To be confirmed'}</b></>}</div>
              {t.resources && <div className="text-[12.5px] text-[#555]"><b>Pre-reading:</b> {t.resources}</div>}
            </div>
          </Collapsible>);
      })}</div>
    </div>
  );
}
