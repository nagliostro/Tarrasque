/** Preferência "animação de fundo": conveniência por navegador (localStorage), não da conta. */
const KEY = 'tarrasque-bg-animation';
const EVENT = 'tarrasque-bg-animation';

export function readBackgroundAnimation(): boolean {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
}

export function writeBackgroundAnimation(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off');
  } catch {
    // sem armazenamento: vale só até recarregar
  }
  window.dispatchEvent(new Event(EVENT));
}

export function subscribeBackgroundAnimation(callback: () => void): () => void {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
