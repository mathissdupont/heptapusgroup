'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Canvas'ı sadece istemci tarafında yükle (SSR yok)
const BackgroundCanvas = dynamic(() => import('@/components/BackgroundCanvas'), {
  ssr: false,
});

export default function BackgroundCanvasShell() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 1) küçük ekran (<= 767px)
    const isSmall = window.matchMedia('(max-width: 767px)').matches;
    // 2) touch/corse pointer (çoğu mobil/tablet)
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    // 3) kullanıcı "reduced motion" istiyor mu?
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // bu koşullarda render ETME
    if (!isSmall && !isTouch && !reduceMotion) {
      setShow(true);
    }
  }, []);

  if (!show) return null;
  return <BackgroundCanvas />;
}
