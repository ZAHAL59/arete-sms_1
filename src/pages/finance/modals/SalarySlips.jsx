import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import { fmt } from '../constants';

// PF (employee) 12% of salary and ₹200 professional tax above ₹15,000 — as set in the original system. Verify with your accountant.
export function slipFor(s) { const pf = Math.round(s.salary * 0.12), pt = s.salary > 15000 ? 200 : 0; return { gross: s.salary, pf, pt, net: s.salary - pf - pt }; }

export function slipsHtml(staff, month) {
  const slip = s => { const x = slipFor(s); return `<div style="border:1px solid #ccc;border-radius:8px;padding:22px;margin-bottom:22px;page-break-inside:avoid">
<div style="display:flex;justify-content:space-between;border-bottom:2px solid #C8202E;padding-bottom:10px;margin-bottom:14px"><div><div style="font-size:18px;font-weight:800;color:#C8202E">Arete Model School</div><div style="font-size:12px;color:#666">Kozhikode, Kerala</div></div><div style="text-align:right"><div style="font-weight:700">SALARY SLIP</div><div style="font-size:12px;color:#666">${month}</div></div></div>
<div style="background:#FEF4F4;padding:10px 12px;border-radius:6px;margin-bottom:12px"><b style="font-size:15px">${s.name}</b><div style="font-size:12px;color:#555">${s.subj} · Emp ID ${s.id} · Joined ${s.joined || '—'}</div></div>
<table style="width:100%;border-collapse:collapse;font-size:13px"><tr style="background:#f5f5f5"><th style="padding:7px;text-align:left;border:1px solid #ddd">Earnings</th><th style="padding:7px;text-align:right;border:1px solid #ddd">₹</th><th style="padding:7px;text-align:left;border:1px solid #ddd">Deductions</th><th style="padding:7px;text-align:right;border:1px solid #ddd">₹</th></tr>
<tr><td style="padding:7px;border:1px solid #ddd">Monthly salary</td><td style="padding:7px;text-align:right;border:1px solid #ddd">${x.gross.toLocaleString('en-IN')}</td><td style="padding:7px;border:1px solid #ddd">Provident Fund (12%)</td><td style="padding:7px;text-align:right;border:1px solid #ddd">${x.pf.toLocaleString('en-IN')}</td></tr>
<tr><td style="padding:7px;border:1px solid #ddd"></td><td style="padding:7px;border:1px solid #ddd"></td><td style="padding:7px;border:1px solid #ddd">Professional Tax</td><td style="padding:7px;text-align:right;border:1px solid #ddd">${x.pt.toLocaleString('en-IN')}</td></tr>
<tr style="font-weight:700;background:#FEF4F4"><td style="padding:8px;border:1px solid #ddd" colspan="3">Net pay</td><td style="padding:8px;text-align:right;border:1px solid #ddd">₹${x.net.toLocaleString('en-IN')}</td></tr></table></div>`; };
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Salary Slips — ${month}</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111}@media print{button{display:none}}</style></head><body><p style="text-align:center"><button onclick="window.print()" style="padding:8px 22px;background:#C8202E;color:#fff;border:0;border-radius:6px;cursor:pointer">Print</button></p>${staff.map(slip).join('')}</body></html>`;
}

export default function SalarySlipsModal({ staff, title, onClose }) {
  const month = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });
  const html = slipsHtml(staff, month);
  return (
    <Modal open onClose={onClose} size="lg" title={title} subtitle={`${month} · ${staff.length} slip(s)`} footer={<><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={() => { const w = window.open('', '_blank', 'width=860,height=900'); if (w) { w.document.write(html); w.document.close(); } }}>🖨 Open & Print</Button></>}>
      <iframe title="Salary slips" srcDoc={html} className="w-full h-[420px] border border-[#E4E4E4] rounded-[8px]" />
      <p className="text-[11.5px] text-[#AAA] mt-2">Deductions: Provident Fund 12% of salary and ₹200 professional tax (salaries above ₹15,000), as set in the original system — please confirm these with your accountant.</p>
    </Modal>
  );
}
