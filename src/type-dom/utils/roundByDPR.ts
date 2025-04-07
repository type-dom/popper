import { getDPR } from './getDPR';
import { FloatingElement } from '../../core';

export function roundByDPR(element: FloatingElement, value: number) {
  const dpr = getDPR(element);
  return Math.round(value * dpr) / dpr;
}
