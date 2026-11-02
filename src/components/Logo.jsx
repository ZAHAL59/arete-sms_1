import { useState } from 'react';

// Put your logo in the project's /public folder. Either file name works:
//   public/arete-logo.png   or   public/arete_logo.png
// If neither file is found, the red "A" badge is shown instead.
const SOURCES = ['/arete-logo.png', '/arete_logo.png'];

export default function Logo({ size = 32 }) {
  const [i, setI] = useState(0);
  if (i >= SOURCES.length) {
    return (
      <div style={{ width: size, height: size }} className="rounded-[7px] bg-[#C8202E] flex items-center justify-center text-white font-bold text-[13px] flex-shrink-0">A</div>
    );
  }
  return <img src={SOURCES[i]} alt="Arete" onError={() => setI(i + 1)} style={{ width: size, height: size }} className="object-contain flex-shrink-0" />;
}
