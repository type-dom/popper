import type { Middleware } from '../dom';
import { arrow as apply } from '../dom';
import type { ArrowOptions } from './types';

/**
 * Positions an inner element of the floating element such that it is centered to the reference element.
 * @param options The arrow options.
 * @see https://floating-ui.com/docs/arrow
 */
export function arrow(options: ArrowOptions): Middleware {
  return {
    name: 'arrow',
    options,
    fn(args) {
      const element = options.element;

      if (element == null) {
        return {};
      }

      return apply({ element, padding: options.padding }).fn(args);
    },
  };
}
