import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import useStore from '../../../store/useStore';
import { fmt } from '../constants';

const monthName = ym => new Date(ym + '-01T00:00:00').toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
export function receiptHtml(p, stu) {
  const rows = [['Receipt No.', p.id], ['Student', stu?.name || '—'], ['Class', stu ? `${stu.cls} ${stu.section}` : '—'], ['Category', p.category], ...(p.period ? [['For month', monthName(p.period)]] : []), ['Amount', fmt(p.amount)], ['Date', p.date], ['Mode', p.mode], ...(p.ref ? [['Reference', p.ref]] : [])];
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Receipt ${p.id}</title><style>body{font-family:Arial,sans-serif;padding:30px;color:#111;max-width:460px;margin:auto}h2{font-size:16px;margin:0 0 4px;color:#C8202E}.s{color:#777;font-size:12px;margin-bottom:18px}table{width:100%;border-collapse:collapse}td{padding:9px 10px;border-bottom:1px solid #E4E4E4;font-size:13px}td:last-child{font-weight:700;text-align:right}.f{margin-top:22px;font-size:11px;color:#999;text-align:center}@media print{button{display:none}}</style></head><body><h2>Fee Receipt</h2><div class="s">Arete Model School, Kozhikode</div><table>${rows.map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`).join('')}</table><div class="f">Computer-generated receipt · No signature required</div><p style="text-align:center;margin-top:18px"><button onclick="window.print()" style="padding:8px 22px;background:#C8202E;color:#fff;border:0;border-radius:6px;cursor:pointer">Print Receipt</button></p></body></html>`;
}

export default function ReceiptModal({ payment, onClose }) {
  const stu = useStore(s => s.db.students.find(x => x.id === payment.studentId));
  const html = receiptHtml(payment, stu);
  return (
    <Modal open onClose={onClose} title="Fee Receipt" subtitle={payment.id} footer={<><Button variant="outline" onClick={onClose}>Close</Button><Button onClick={() => { const w = window.open('', '_blank', 'width=520,height=640'); if (w) { w.document.write(html); w.document.close(); } }}>🖨 Open & Print</Button></>}>
      <iframe title="Receipt" srcDoc={html} className="w-full h-[360px] border border-[#E4E4E4] rounded-[8px]" />
    </Modal>
  );
}
