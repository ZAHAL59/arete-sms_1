import { PageHeader } from '../../components/Layout';
import Collapsible from '../../components/ui/Collapsible';
import Badge from '../../components/ui/Badge';
import { getNotices } from './constants';

export default function Alerts() {
  const DEMO_ANN = getNotices();
  return (
    <div className="p-6">
      <PageHeader title="Alerts & Notices" subtitle={`${DEMO_ANN.length} announcements from Principal and HR`} />
      <div className="space-y-2">
        {DEMO_ANN.map((a,i) => (
          <Collapsible key={i}
            header={
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  {a.urgent && <Badge variant="red" className="mb-1">Urgent</Badge>}
                  <div className="text-[13.5px] font-bold text-[#111]">{a.title}</div>
                  <div className="text-[11px] text-[#AAA] mt-0.5">{a.sent} · To: {a.to}</div>
                </div>
              </div>
            }
            className={a.urgent ? '!border-l-[3px] !border-l-[#DC2626]' : '!border-l-[3px] !border-l-[#C8202E]'}
          >
            <div className="px-4 py-3 border-t border-[#E4E4E4] text-[13px] text-[#555] leading-relaxed">{a.msg}</div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
