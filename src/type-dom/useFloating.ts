import type {
  FloatingElement,
  MiddlewareData,
  ReferenceElement
} from '../dom';
import { computePosition } from '../dom';

import type {
  MaybeElement,
  UseFloatingOptions,
  UseFloatingReturn
} from './types';
import { getDPR } from './utils/getDPR';
import { roundByDPR } from './utils/roundByDPR';

/**
 * Computes the `x` and `y` coordinates that will place the floating element next to a reference element when it is given a certain CSS positioning strategy.
 * @param reference The reference template ref.
 * @param floating The floating template ref.
 * @param options The floating options.
 * @see https://floating-ui.com/docs/vue
 */
export function useFloating<T extends ReferenceElement = ReferenceElement>(
  reference: Readonly<MaybeElement<T>>,
  floating: Readonly<MaybeElement<FloatingElement>>,
  options: UseFloatingOptions<T> = {}
): UseFloatingReturn {

  const whileElementsMountedOption = options.whileElementsMounted;
  const openOption = options.open ?? true;
  const middlewareOption = options.middleware;
  const placementOption = options.placement ?? 'bottom';
  const strategyOption = options.strategy ?? 'absolute';
  const transformOption = options.transform ?? true;
  const referenceElement = reference;
  const floatingElement = floating;
  const floatingReturn: UseFloatingReturn = {
    x: 0,
    y: 0,
    strategy: options.strategy ?? 'absolute',
    placement: options.placement ?? 'bottom',
    middlewareData: {},
    isPositioned: false,
    floatingStyles: {
      position: options.strategy ?? 'absolute',
      left: '0',
      top: '0'
    },
    update: () => {/**/
    }
  };

  // const floatingStyles = (() => {
  const initialStyles = {
    position: floatingReturn.strategy,
    left: '0',
    top: '0'
  };

  if (floatingElement) {
    const xVal = roundByDPR(floatingElement, floatingReturn.x);
    const yVal = roundByDPR(floatingElement, floatingReturn.y);

    if (transformOption) {
      floatingReturn.floatingStyles = {
        ...initialStyles,
        transform: `translate(${xVal}px, ${yVal}px)`,
        ...(getDPR(floatingElement) >= 1.5 && { willChange: 'transform' })
      };
    } else {
      floatingReturn.floatingStyles = {
        position: floatingReturn.strategy,
        left: `${xVal}px`,
        top: `${yVal}px`
      };
    }
  } else {
    // floatingReturn.floatingStyles = initialStyles; // 无意义
  }

  let whileElementsMountedCleanup: (() => void) | undefined;

  async function update() {
    if (referenceElement == null || floatingElement == null) {
      return;
    }

    const open = openOption;

    const position = await computePosition(referenceElement, floatingElement, {
      middleware: middlewareOption,
      placement: placementOption,
      strategy: strategyOption
    });
    floatingReturn.x = position.x;
    floatingReturn.y = position.y;
    floatingReturn.strategy = position.strategy;
    floatingReturn.placement = position.placement;
    floatingReturn.middlewareData = position.middlewareData;
    /**
     * The floating element's position may be recomputed while it's closed
     * but still mounted (such as when transitioning out). To ensure
     * `isPositioned` will be `false` initially on the next open, avoid
     * setting it to `true` when `open === false` (must be specified).
     */
    floatingReturn.isPositioned = open !== false;
  }

  floatingReturn.update = update;

  function cleanup() {
    if (typeof whileElementsMountedCleanup === 'function') {
      whileElementsMountedCleanup();
      whileElementsMountedCleanup = undefined;
    }
  }

  function attach() {
    cleanup();

    if (whileElementsMountedOption === undefined) {
      update();
      return;
    }

    if (referenceElement != null && floatingElement != null) {
      whileElementsMountedCleanup = whileElementsMountedOption(
        referenceElement,
        floatingElement,
        update
      );
      return;
    }
  }

  function reset() {
    if (!openOption) {
      floatingReturn.isPositioned = false;
    }
  }

  // watch(
  //   [middlewareOption, placementOption, strategyOption, openOption],
  //   update,
  //   {
  //     flush: 'sync',
  //   },
  // );
  // watch([referenceElement, floatingElement], attach, { flush: 'sync' });
  // watch(openOption, reset, { flush: 'sync' });

  // if (getCurrentScope()) {
  //   onScopeDispose(cleanup);
  // }

  return floatingReturn;
}
