import { useEffect } from 'react';

// Sets the browser tab title and tells search engines whether to index the page.
// Everything is private by default; only the public Careers page opts in.
export default function usePageMeta(title, { index = false } = {}) {
  useEffect(() => {
    document.title = title ? `${title} · Arete Model School` : 'Arete Model School';
    let m = document.querySelector('meta[name="robots"]');
    if (!m) { m = document.createElement('meta'); m.name = 'robots'; document.head.appendChild(m); }
    m.content = index ? 'index, follow' : 'noindex, nofollow';
  }, [title, index]);
}
