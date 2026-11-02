import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

// The current page lives in the address (?v=fees), so refresh, Back and shared links all land in the right place.
export default function useShellView(defaultView, valid) {
  const [sp, setSp] = useSearchParams();
  const v = sp.get('v');
  const view = valid.includes(v) ? v : defaultView;
  const setView = useCallback(next => setSp(prev => { const n = new URLSearchParams(prev); n.set('v', next); return n; }), [setSp]);
  return [view, setView];
}
