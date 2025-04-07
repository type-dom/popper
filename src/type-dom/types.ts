import type {
  FloatingElement,
  Middleware,
  MiddlewareData,
  Padding,
  Placement,
  ReferenceElement,
  Strategy,
} from '../dom';
// import type {ComponentPublicInstance, Ref} from 'vue-demi';

export type {
  AlignedPlacement,
  Alignment,
  AutoPlacementOptions,
  AutoUpdateOptions,
  Axis,
  Boundary,
  ClientRectObject,
  ComputePositionConfig,
  ComputePositionReturn,
  Coords,
  DetectOverflowOptions,
  Dimensions,
  ElementContext,
  ElementRects,
  Elements,
  FlipOptions,
  FloatingElement,
  HideOptions,
  InlineOptions,
  Length,
  Middleware,
  MiddlewareData,
  MiddlewareReturn,
  MiddlewareState,
  NodeScroll,
  OffsetOptions,
  Padding,
  Placement,
  Platform,
  Rect,
  ReferenceElement,
  RootBoundary,
  ShiftOptions,
  Side,
  SideObject,
  SizeOptions,
  Strategy,
  VirtualElement,
} from '../dom';

export type MaybeReadonlyRef<T> = T | Readonly<T>;

export type MaybeReadonlyRefOrGetter<T> = MaybeReadonlyRef<T> | (() => T);

export type MaybeElement<T> = T | null | undefined;

export type UseFloatingOptions<T extends ReferenceElement = ReferenceElement> =
  {
    /**
     * Represents the open/close state of the floating element.
     * @default true
     */
    open?: boolean;
    /**
     * Where to place the floating element relative to its reference element.
     * @default 'bottom'
     */
    placement?: Placement;
    /**
     * The type of CSS position property to use.
     * @default 'absolute'
     */
    strategy?: Strategy;
    /**
     * These are plain objects that modify the positioning coordinates in some fashion, or provide useful data for the consumer to use.
     * @default undefined
     */
    middleware?: Middleware[];
    /**
     * Whether to use `transform` instead of `top` and `left` styles to
     * position the floating element (`floatingStyles`).
     * @default true
     */
    transform?: boolean;
    /**
     * Callback to handle mounting/unmounting of the elements.
     * @default undefined
     */
    whileElementsMounted?: (
      reference: T,
      floating: FloatingElement,
      update: () => void,
    ) => () => void;
  };

export type UseFloatingReturn = {
  /**
   * The x-coord of the floating element.
   */
  x: Readonly<number>;
  /**
   * The y-coord of the floating element.
   */
  y: Readonly<number>;
  /**
   * The stateful placement, which can be different from the initial `placement` passed as options.
   */
  placement: Readonly<Placement>;
  /**
   * The type of CSS position property to use.
   */
  strategy: Readonly<Strategy>;
  /**
   * Additional data from middleware.
   */
  middlewareData: Readonly<MiddlewareData>;
  /**
   * The boolean that let you know if the floating element has been positioned.
   */
  isPositioned: Readonly<boolean>;
  /**
   * CSS styles to apply to the floating element to position it.
   */
  floatingStyles: Readonly<
    {
      position: Strategy;
      top: string;
      left: string;
      transform?: string;
      willChange?: string;
    }
  >;
  /**
   * The function to update floating position manually.
   */
  update: () => void;
};

export type ArrowOptions = {
  /**
   * The arrow element or template ref to be positioned.
   * @required
   */
  element?: Element;
  /**
   * The padding between the arrow element and the floating element edges. Useful when the floating element has rounded corners.
   * @default 0
   */
  padding?: Padding;
};
