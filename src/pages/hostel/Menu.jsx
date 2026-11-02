import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/Layout';
import Button from '../../components/ui/Button';
import { DAYS } from './constants';

const MEALS = [['B', '☀️ Breakfast'], ['L', '🌿 Lunch'], ['D', '🌙 Dinner']];
const COLORS = { B: '#FFF3CD', L: '#D4EDDA', D: '#CCE5FF' };       // meal tints, as in the original
const BORDER = { B: '#F0C040', L: '#82C99A', D: '#7EB9FF' };
const esc = t => String(t || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

function printMenu(menu) {
  const th = 'border:1px solid #ccc;padding:8px;background:#eee;font-size:12px', td = 'border:1px solid #ccc;padding:8px;font-size:12px;vertical-align:top';
  const rows = MEALS.map(([k, l]) => `<tr><td style="${td};font-weight:700;background:#f5f5f5">${l.replace(/^\S+\s/, '')}</td>${DAYS.map(d => `<td style="${td}">${esc((menu[d] || {})[k])}</td>`).join('')}</tr>`).join('');
  const w = window.open('', '_blank', 'width=1000,height=700'); if (!w) return;
  w.document.write(`<!DOCTYPE html><html><head><title>Weekly Mess Menu</title></head><body style="font-family:Arial,sans-serif;padding:24px"><h2 style="margin-bottom:4px">Arete Model School — Hostel Mess Menu</h2><p style="color:#666;font-size:13px;margin-bottom:16px">Week of ${new Date().toDateString()}</p><table style="width:100%;border-collapse:collapse"><thead><tr><th style="${th}">Meal</th>${DAYS.map(d => `<th style="${th}">${d}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table><button onclick="window.print()" style="margin-top:20px;padding:8px 20px;background:#C8202E;color:#fff;border:none;border-radius:6px;cursor:pointer">Print</button></body></html>`);
  w.document.close();
}

export default function Menu({ h, saveMenu }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(h.menu)));
  const [savedAt, setSavedAt] = useState(null);
  useEffect(() => { setDraft(JSON.parse(JSON.stringify(h.menu))); }, [h.menu]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(h.menu);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const set = (d, m, v) => { setDraft(x => ({ ...x, [d]: { ...x[d], [m]: v } })); setSavedAt(null); };
  function save() { saveMenu(draft); setSavedAt(new Date().toTimeString().slice(0, 5)); }

  return (
    <div className="p-6">
      <PageHeader title="Weekly Mess Menu Planner" subtitle="Edit the meal schedule for each day — save to publish for students and parents"
        actions={<>{dirty && <span className="text-[12px] font-semibold text-[#B45309]">● Unsaved changes</span>}{savedAt && !dirty && <span className="text-[12px] font-semibold text-[#166534]">✓ Saved at {savedAt}</span>}
          <Button variant="outline" onClick={() => printMenu(h.menu)}>🖨 Print Menu</Button><Button onClick={save} disabled={!dirty}>✓ Save Menu</Button></>} />

      <div className="bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)]">
        <div className="flex items-center px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8]"><div className="text-[13.5px] font-bold text-[#111]">🍽 Meal Schedule</div>
          <div className="ml-auto flex gap-4 text-[12px] text-[#777]">{MEALS.map(([k, l]) => <span key={k} className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-[3px] border" style={{ background: COLORS[k], borderColor: BORDER[k] }} />{l.replace(/^\S+\s/, '')}</span>)}</div></div>
        <div className="p-3 overflow-x-auto">
          <table className="w-full min-w-[980px]" style={{ borderCollapse: 'separate', borderSpacing: 4 }}>
            <thead><tr><th className="w-[90px]" />{DAYS.map(d => <th key={d} className={`text-left px-2 py-1.5 text-[11px] font-bold ${d === today ? 'text-[#C8202E]' : 'text-[#777]'}`}>{d}{d === today && <span className="ml-1.5 text-[9px] bg-[#C8202E] text-white px-1.5 py-0.5 rounded-full align-middle">Today</span>}</th>)}</tr></thead>
            <tbody>{MEALS.map(([k, label]) => (
              <tr key={k}>
                <td className="p-1 align-top"><div className="text-[11px] font-bold text-[#999] whitespace-nowrap py-1">{label}</div></td>
                {DAYS.map(d => (
                  <td key={d} className="p-1 align-top">
                    <div className="rounded-[7px] overflow-hidden" style={{ background: COLORS[k], border: `1px solid ${BORDER[k]}`, boxShadow: d === today ? `0 0 0 2px ${BORDER[k]}` : 'none' }}>
                      <textarea value={(draft[d] || {})[k] || ''} onChange={e => set(d, k, e.target.value)} aria-label={`${d} ${label}`}
                        className="w-full min-h-[86px] border-none bg-transparent text-[11.5px] px-2 py-1.5 text-[#333] resize-y outline-none font-[inherit]" />
                    </div>
                  </td>))}
              </tr>))}</tbody>
          </table>
        </div>
      </div>
      <div className="mt-3 bg-[#FEF4F4] border border-[#FECACA] rounded-[8px] px-4 py-3 text-[12.5px] text-[#555] leading-relaxed"><b className="text-[#9A1822]">ⓘ Menu Planning Guidelines:</b> Ensure balanced nutrition — protein at every meal, green vegetable daily, fruit twice weekly. Special dietary needs are managed per student profile.</div>
    </div>
  );
}
