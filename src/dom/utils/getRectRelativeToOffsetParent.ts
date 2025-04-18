import type { Rect, Strategy } from '../../core';
import { createCoords } from '../../utils';
import {
  getNodeName,
  getNodeScroll,
  isHTMLElement,
  isOverflowElement
} from '../../utils/dom';

import type { VirtualElement } from '../types';
import { getDocumentElement } from '../platform/getDocumentElement';
import { getBoundingClientRect } from './getBoundingClientRect';
import { getWindowScrollBarX } from './getWindowScrollBarX';
import { getHTMLOffset } from './getHTMLOffset';

export function getRectRelativeToOffsetParent(
  element: Element | VirtualElement,
  offsetParent: Element | Window,
  strategy: Strategy
): Rect {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const isFixed = strategy === 'fixed';
  const rect = getBoundingClientRect(element, true, isFixed, offsetParent);

  let scroll = { scrollLeft: 0, scrollTop: 0 };
  const offsets = createCoords(0);

  if (isOffsetParentAnElement || (!isOffsetParentAnElement && !isFixed)) {
    if (
      getNodeName(offsetParent) !== 'body' ||
      isOverflowElement(documentElement)
    ) {
      scroll = getNodeScroll(offsetParent);
    }

    if (isOffsetParentAnElement) {
      const offsetRect = getBoundingClientRect(
        offsetParent,
        true,
        isFixed,
        offsetParent
      );
      offsets.x = offsetRect.x + offsetParent.clientLeft;
      offsets.y = offsetRect.y + offsetParent.clientTop;
    } else if (documentElement) {
      // If the <body> scrollbar appears on the left (e.g. RTL systems). Use
      // Firefox with layout.scrollbar.side = 3 in about:config to tests this.
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }

  const htmlOffset =
    documentElement && !isOffsetParentAnElement && !isFixed
      ? getHTMLOffset(documentElement, scroll)
      : createCoords(0);

  const x = rect.left + scroll.scrollLeft - offsets.x - htmlOffset.x;
  const y = rect.top + scroll.scrollTop - offsets.y - htmlOffset.y;

  return {
    x,
    y,
    width: rect.width,
    height: rect.height
  };
}
