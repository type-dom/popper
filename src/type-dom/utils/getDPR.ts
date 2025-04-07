import { FloatingElement } from '../../core';
export function getDPR(element: FloatingElement): number {
  if (typeof window === 'undefined') {
    return 1;
  }
  const win = element.ownerDocument.defaultView || window;
  return win.devicePixelRatio || 1;
}
