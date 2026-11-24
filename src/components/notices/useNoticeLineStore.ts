import { useEffect, useRef, useState } from 'react';

/** Durée d'un envoi simulé : l'objet reste "en envoi" pendant ce délai. */
const SEND_DURATION = 4000;

/**
 * Lignes investisseurs des notices d'un écran : générées à la demande, puis modifiées par les actions.
 * Un envoi garde l'objet verrouillé le temps du traitement, comme le ferait le serveur.
 */
export function useNoticeLineStore<P extends { id: number }, L>(generate: (parent: P) => L[]) {
  const [overrides, setOverrides] = useState<Map<number, L[]>>(() => new Map());
  const [sendingIds, setSendingIds] = useState<Set<number>>(() => new Set());
  const cache = useRef(new Map<number, { parent: P; lines: L[] }>());
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(id => window.clearTimeout(id)), []);

  const generated = (parent: P) => {
    const hit = cache.current.get(parent.id);
    if (hit && hit.parent === parent) return hit.lines;
    const lines = generate(parent);
    cache.current.set(parent.id, { parent, lines });
    return lines;
  };

  const linesOf = (parent: P) => overrides.get(parent.id) ?? generated(parent);

  const updateLines = (parent: P, update: (lines: L[]) => L[]) =>
    setOverrides(prev => new Map(prev).set(parent.id, update(prev.get(parent.id) ?? generated(parent))));

  const send = (parent: P, apply: (lines: L[]) => L[], onDone: () => void) => {
    setSendingIds(prev => new Set(prev).add(parent.id));
    timers.current.push(
      window.setTimeout(() => {
        updateLines(parent, apply);
        setSendingIds(prev => {
          const next = new Set(prev);
          next.delete(parent.id);
          return next;
        });
        onDone();
      }, SEND_DURATION),
    );
  };

  return { linesOf, updateLines, send, isSending: (id: number) => sendingIds.has(id), overrides };
}
