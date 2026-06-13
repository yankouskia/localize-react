import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  // The translation cache is now per-provider (closure-scoped), so it is
  // discarded automatically when `cleanup()` unmounts each provider —
  // there is no module-level cache to reset.
  cleanup();
  vi.restoreAllMocks();
});
