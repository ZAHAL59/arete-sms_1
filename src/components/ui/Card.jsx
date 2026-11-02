export function Card({ children, className = '' }) {
  return <div className={`bg-white border border-[#E4E4E4] rounded-[10px] overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,.07)] ${className}`}>{children}</div>;
}
export function CardHeader({ children, className = '' }) {
  return <div className={`flex items-center justify-between px-4 py-3 border-b border-[#E4E4E4] bg-[#F8F8F8] flex-wrap gap-2 ${className}`}>{children}</div>;
}
export function CardTitle({ children }) {
  return <div className="text-[13.5px] font-bold text-[#111]">{children}</div>;
}
export function CardBody({ children, className = '' }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}
