import { useEffect, useState } from 'react';

export function useSectionSpy(ids: string[], offset = 140): string {

  const key = ids.join('|');
  const [activeId, setActiveId] = useState(ids[0] ?? '');

  useEffect(() => {
    const sectionIds = key ? key.split('|') : [];
    if (sectionIds.length === 0) return;

    function handleScroll() {

      const reachedBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      if (reachedBottom) {
        setActiveId(sectionIds[sectionIds.length - 1]);
        return;
      }

      let current = sectionIds[0];
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;
        if (element.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActiveId(current);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [key, offset]);

  return activeId;
}
