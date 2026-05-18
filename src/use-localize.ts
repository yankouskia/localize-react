import { useContext } from 'react';
import { LocalizationContext } from './Provider.js';
import type { LocalizationContextValue } from './types.js';

/**
 * Read the current {@link LocalizationContextValue} from the nearest
 * {@link LocalizationProvider}. Throws nothing if there is no provider —
 * a no-op `translate` (returns the descriptor) is used instead.
 *
 * @example
 * ```tsx
 * function Greeting() {
 *   const { translate } = useLocalize();
 *   return <h1>{translate('greeting.hello', { name: 'World' })}</h1>;
 * }
 * ```
 */
export function useLocalize(): LocalizationContextValue {
  return useContext(LocalizationContext);
}
