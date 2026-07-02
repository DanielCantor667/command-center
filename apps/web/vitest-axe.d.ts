// vitest-axe (0.1.0) augments Vitest's legacy `Vi` namespace, which no longer
// backs `expect()`'s return type in Vitest 2.x (Vitest re-exports `Assertion`
// from `@vitest/expect` instead). Without this declaration,
// `expect(results).toHaveNoViolations()` fails to type-check across every
// test file that uses the matcher, even though it is registered correctly at
// runtime via `expect.extend(matchers)` in `vitest.setup.ts`. This follows the
// same pattern `@testing-library/jest-dom/vitest` uses to augment Vitest's
// `Assertion` interface for its own custom matchers.
import 'vitest';
import type { AxeMatchers } from 'vitest-axe/matchers';

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-object-type -- `T` and the empty body are required for declaration merging with Vitest's own `Assertion<T>` interface.
  interface Assertion<T = unknown> extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type -- required for declaration merging with Vitest's own `AsymmetricMatchersContaining` interface.
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
