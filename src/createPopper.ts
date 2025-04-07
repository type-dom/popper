import { IStyle } from '@type-dom/css-type';
import { setStyle, AnyFn } from '@type-dom/utils';
import type {
  ReferenceElement,
  ComputePositionConfig,
  // FloatingElement,
  VirtualElement,
  Middleware,
} from './dom/types';
import { computePosition, Placement, Strategy } from './dom/index';
import { MiddlewareState, MiddlewareData, FloatingElement } from './core/types';
// import {
//   offset,
//   flip,
//   arrow,
//   hide,
//   size,
//   detectOverflow,
//   autoPlacement,
// } from './dom/middleware';
import { debounce } from './utils/debounce';
// import { isElement } from './utils/dom';

export type PopperOptions = {
  placement?: Placement;
  strategy?: Strategy;
  middleware?: Array<Middleware>;
  onFirstUpdate?: AnyFn;
};
const DEFAULT_OPTIONS: PopperOptions = {
  placement: 'bottom',
  middleware: [],
  strategy: 'absolute',
};

// const defaultMiddlewares = [
//   // 默认的中间件
//   // eventListeners,
//   // popperOffsets,
//   // computeStyles,
//   // applyStyles,
//   // autoPlacement,
//   offset,
//   flip,
//   // preventOverflow,
//   detectOverflow,
//   // size,
//   arrow,
//   hide,
// ] as Array<(args: any[]) => Middleware>;

// export function getWindow(node: Element | Window) {
//   if (node == null) {
//     return window;
//   }
//
//   if (node.toString() !== '[object Window]') {
//     const ownerDocument = (node as Element).ownerDocument;
//     return ownerDocument ? ownerDocument.defaultView || window : window;
//   }
//
//   return node;
// }

// function isElement(node: unknown) {
//   const OwnElement = getWindow(node).Element;
//   return node instanceof OwnElement || node instanceof Element;
// }

function areValidElements(...args: Array<any>): boolean {
  return !args.some(
    (element) =>
      !(element && typeof element.getBoundingClientRect === 'function')
  );
}

export async function createPopper(
  reference: ReferenceElement,
  popper: FloatingElement,
  options = DEFAULT_OPTIONS
) {
  const state = {
    placement: 'bottom',
    // orderedModifiers: [],
    // options: {
    //   // ...DEFAULT_OPTIONS,
    //   ...defaultMiddlewares },
    options: {
      ...DEFAULT_OPTIONS,
      ...options,
    },
    // modifiersData: {},
    middlewareData: {},
    // middlewares: defaultMiddlewares,
    elements: {
      reference,
      popper,
    },
    attributes: {},
    styles: {},
  } as State;

  let effectCleanupFns: Array<() => void> = [];
  let isDestroyed = false;

  const instance: Instance = {
    state: state as State,
    setOptions(setOptionsAction: SetAction<ComputePositionConfig>) {
      // console.warn('options.setOptions() is .');
      const options =
        typeof setOptionsAction === 'function'
          ? setOptionsAction(state.options)
          : setOptionsAction;

      cleanupModifierEffects();

      state.options = {
        // $FlowFixMe[exponential-spread]
        // ...defaultOptions,
        ...state.options,
        ...options,
      };

      // state.scrollParents = {
      //   reference: isElement(reference)
      //     ? listScrollParents(reference)
      //     : reference.contextElement
      //       ? listScrollParents(reference.contextElement)
      //       : [],
      //   popper: listScrollParents(popper),
      // };
      //
      // // Orders the modifiers based on their dependencies and `phase`
      // // properties
      // const orderedModifiers = orderModifiers(
      //   mergeByName([...defaultModifiers, ...state.options.modifiers])
      // );
      //
      // // Strip out disabled modifiers
      // state.orderedModifiers = orderedModifiers.filter((m) => m.enabled);

      runModifierEffects();

      return instance.update();
    },

    // Sync update – it will always be executed, even if not necessary. This
    // is useful for low frequency updates where sync behavior simplifies the
    // logic.
    // For high frequency updates (e.g. `resize` and `scroll` events), always
    // prefer the async Popper#update method
    async forceUpdate(): Promise<void> {
      // console.warn('forceUpdate .');
      if (isDestroyed) {
        return;
      }

      const { reference, popper } = state.elements;

      // Don't proceed if `reference` or `popper` are not valid elements
      // anymore
      if (!areValidElements(reference, popper)) {
        return;
      } // Store the reference and popper rects to be read by modifiers

      // state.rects = {
      //   reference: getCompositeRect(
      //     reference,
      //     getOffsetParent(floating),
      //     state.options.strategy === 'fixed'
      //   ),
      //   popper: getLayoutRect(floating),
      // };

      // Modifiers have the ability to reset the current update cycle. The
      // most common use case for this is the `flip` modifier changing the
      // placement, which then needs to re-run all the modifiers, because the
      // logic was previously ran for the previous placement and is therefore
      // stale/incorrect
      // state.reset = false;

      // state.placement = state.options.placement;

      // On each update cycle, the `modifiersData` property for each modifier
      // is filled with the initial data specified by the modifier. This means
      // it doesn't persist and is fresh on each update.
      // To ensure persistent data, use `${name}#persistent`
      // state.orderedModifiers.forEach(
      //   (modifier) =>
      //     (state.modifiersData[modifier.name] = {
      //       ...modifier.data,
      //     })
      // );

      //   for (let index = 0; index < state.orderedModifiers.length; index++) {
      //     if (state.reset === true) {
      //       state.reset = false;
      //       index = -1;
      //       continue;
      //     }
      //
      //     const { fn, options = {}, name } = state.orderedModifiers[index];
      //
      //     if (typeof fn === 'function') {
      //       state = fn({ state, options, name, instance }) || state;
      //     }
      //   }
      // options = Object.assign(options, state.options);
      // console.log('state.options is ', state.options, ' then computePosition');

      const computed = await computePosition(reference, popper, state.options);
      // console.log('computed is ', computed);
      // state.rects = computed.rects;
      state.placement = computed.placement;
      state.strategy = computed.strategy;
      state.middlewareData = computed.middlewareData;
      state.styles = {
        popper: {
          left: computed.x,
          top: computed.y,
        }
      };

      /// below add by me
      if (!reference) {
        return;
      }
      if (popper) {
        const popperStyle = {
          left: computed.x,
          top: computed.y,
        };
        if (popperStyle) {
          setStyle(popper, {
            position: state.strategy,
            left: popperStyle.left + 'px',
            top: popperStyle.top + 'px',
          });
        }
        //   this.attr.setObj({
        //     // maybe flip
        //     dataPopperPlacement: state.placement,
        //   });
        // 箭头的定位样式需要用到，不可省略;
        popper.setAttribute('data-popper-placement', state.placement)
        const arrowDom = state.elements.arrow;
        if (arrowDom && state.middlewareData.arrow) {
          // console.warn('arrowDom is ', arrowDom, state.middlewareData.arrow);
          // const arrowStyle = matchPlacement(state.placement?.split('-')?.shift() as keyof typeof $placements || 'top');
          // setStyle(arrowDom, {
          //   position: state.strategy,
          //   ...arrowStyle
          // });

          const arrowParams = state.middlewareData.arrow;
          if (arrowParams?.x) {
            setStyle(arrowDom, {
              left: arrowParams.x + 'px',
            });
          }
          if (arrowParams?.y) {
            setStyle(arrowDom, {
              top: arrowParams.y + 'px',
            });
          }
        }
      }
    },

    // Async and optimistically optimized update – it will not be executed if
    // not necessary (debounced to run at most once-per-tick)
    update: debounce(
      (): Promise<State | undefined> =>
        new Promise((resolve) => {
          // console.warn('createPopper debounce update called');
          instance.forceUpdate().then(() => {
            resolve(state);
          });
        })
    ),

    destroy() {
      cleanupModifierEffects();
      isDestroyed = true;
    },
  };

  if (!areValidElements(reference, popper)) {
    return instance;
  }

  instance.setOptions(options).then((state) => {
    if (!isDestroyed && options.onFirstUpdate) {
      options.onFirstUpdate(state);
    }
  });

  // Modifiers have the ability to execute arbitrary code before the first
  // update cycle runs. They will be executed in the same order as the update
  // cycle. This is useful when a modifier adds some persistent data that
  // other modifiers need to use, but the modifier is run after the dependent
  // one.
  function runModifierEffects() {
    // state.orderedModifiers.forEach(({ name, options = {}, effect }) => {
    //   if (typeof effect === 'function') {
    //     const cleanupFn = effect({ state, name, instance, options });
    //     const noopFn = () => {};
    //     effectCleanupFns.push(cleanupFn || noopFn);
    //   }
    // });
  }

  function cleanupModifierEffects() {
    effectCleanupFns.forEach((fn) => fn());
    effectCleanupFns = [];
  }

  return instance;
}

type SetAction<S> = S | ((prev: S) => S);

export interface Instance {
  state: State;
  destroy: () => void;
  forceUpdate: () => Promise<void>;
  update: () => Promise<Partial<State>>;
  setOptions: (setOptionsAction: SetAction<ComputePositionConfig>) =>  Promise<Partial<State>>; // Promise<MiddlewareState>,
}

// export type Instance = {
//   state: State,
//   destroy: () => void,
//   forceUpdate: () => void,
//   update: () => Promise<$Shape<State>>,
//   setOptions: (
//     setOptionsAction: SetAction<$Shape<OptionsGeneric<any>>>
//   ) => Promise<$Shape<State>>,
// };

// ComputePositionConfig
// export type OptionsGeneric<TModifier> = {
//   placement: Placement,
//   modifiers: Array<TModifier>,
//   strategy: Strategy,
//   // onFirstUpdate?: ($Shape<State>) => void,
// };

// PopperState
export interface State {
  elements: {
    reference: Element | VirtualElement;
    popper: HTMLElement;
    arrow?: HTMLElement;
  };
  // options: OptionsGeneric<any>,
  options: ComputePositionConfig;
  placement: Placement;
  strategy?: Strategy;
  // orderedModifiers: Array<Modifier<any, any>>,
  orderedMiddlewares: Array<Middleware>,
  // rects: StateRects,
  scrollParents?: {
    reference: Array<Element | Window | VisualViewport>;
    popper: Array<Element | Window | VisualViewport>;
  };
  // styles: {
  //   [key: string]: $Shape<CSSStyleDeclaration>,
  // },
  styles: Record<string, IStyle>;
  attributes: {
    [key: string]: { [key: string]: string | boolean };
  };
  // modifiersData: { // todo middleWareData
  //   arrow?: {
  //     x?: number,
  //     y?: number,
  //     centerOffset: number,
  //   },
  //   hide?: {
  //     isReferenceHidden: boolean,
  //     hasPopperEscaped: boolean,
  //     referenceClippingOffsets: SideObject,
  //     popperEscapeOffsets: SideObject,
  //   },
  //   offset?: OffsetData,
  //   preventOverflow?: Offsets,
  //   popperOffsets?: Offsets,
  //   [key: string]: any,
  // },
  middlewareData: MiddlewareData;
  reset?: boolean;
}

// type OffsetData = { [p: Placement]: Offsets };

// export type SideObject = {
//   top: number,
//   left: number,
//   right: number,
//   bottom: number,
// };
//
// export type Offsets = {
//   y: number,
//   x: number,
// };

// export type Rect = {
//   width: number,
//   height: number,
//   x: number,
//   y: number,
// };

// export type StateRects = {
//   reference: Rect,
//   popper: Rect,
// };
