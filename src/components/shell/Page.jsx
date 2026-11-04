// The roomy, centred frame every Overview page uses.
export default function Page({ title, subtitle, children }) {
  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-14">
      <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-tight text-[#111] mb-1.5">{title}</h1>
      {subtitle ? <p className="text-[14px] text-[#666666] mb-7">{subtitle}</p> : <div className="mb-6" />}
      {children}
    </div>
  );
}
export const TwoCol = ({ children, className = '' }) => <div className={`grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-4 sm:gap-6 ${className}`}>{children}</div>;
export const TwoColTop = ({ children, className = '' }) => <div className={`grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-4 sm:gap-6 items-start ${className}`}>{children}</div>;
export const TileGrid = ({ children }) => <div className="grid grid-cols-2 gap-3 sm:gap-5">{children}</div>;
export const todayLabel = () => new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase().replace(',', ' ·');
export const plural = (n, one, many) => `${n} ${n === 1 ? one : (many || one + 's')}`;
