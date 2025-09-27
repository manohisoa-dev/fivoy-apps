import { createPortal } from 'react-dom';
import { useEffect, useRef } from 'react';
import { useLoadingStore } from '../store/loading';

export default function LoadingOverlay() {
  const count = useLoadingStore(s => s.count);
  const active = count > 0;

  // Petite barre de progression en haut (fake progress)
  const barRef = useRef(null);
  useEffect(() => {
    if (!active || !barRef.current) return;
    let w = 10;
    const id = setInterval(() => {
      // incrémente jusqu'à ~85% tant que ça charge (effet progress)
      w = Math.min(85, w + Math.random() * 10);
      barRef.current.style.width = w + '%';
    }, 250);
    return () => {
      clearInterval(id);
      // complète élégamment
      if (barRef.current) {
        barRef.current.style.width = '100%';
        setTimeout(() => {
          if (barRef.current) barRef.current.style.width = '0%';
        }, 200);
      }
    };
  }, [active]);

  if (!active) return null;

  return createPortal(
    <>
      {/* Top progress bar */}
      <div className="fixed left-0 top-0 z-[100] h-1 w-full bg-gray-200/50">
        <div ref={barRef} className="h-full bg-[#690390] transition-[width] duration-200 ease-out" style={{ width: '0%' }}/>
      </div>
      {/* Scrim + spinner */}
      <div className="fixed inset-0 z-[90] bg-black/20 pointer-events-none" />
      <div className="fixed inset-0 z-[95] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/90 px-6 py-4 shadow">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#690390] border-t-transparent" />
          <div className="text-sm text-gray-700">Chargement…</div>
        </div>
      </div>
    </>,
    document.body
  );
}
