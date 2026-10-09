'use client';

import { useSyncExternalStore } from 'react';
import {
  readBackgroundAnimation,
  subscribeBackgroundAnimation,
  writeBackgroundAnimation,
} from '../motion';

/** Slider (interruptor) que liga/desliga a animação de dados do fundo. */
export function MotionSwitch() {
  const on = useSyncExternalStore(
    subscribeBackgroundAnimation,
    readBackgroundAnimation,
    () => true,
  );
  return (
    <label className="motion-switch">
      <span className="label">Animação de fundo</span>
      <input
        type="checkbox"
        role="switch"
        aria-label="Animação de fundo"
        checked={on}
        onChange={(e) => writeBackgroundAnimation(e.target.checked)}
      />
      <span className="track" aria-hidden="true" />
    </label>
  );
}
