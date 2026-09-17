/**
 * NOT PRODUCT CODE. Nothing imports this but its own test, and nothing should.
 *
 * It is the fixture half of the §9.6-E0 guard: proof that the TypeScript toolchain is wired up and
 * stays wired up. It exercises the four things the first real conversion will need — annotations, a
 * generic, an interface, and a type-only re-export — and it is deliberately trivial, because its job
 * is to fail when the TOOLCHAIN breaks, never because of its own logic.
 *
 * Two independent pipelines read this file, and that is the point:
 *   - `npm run typecheck` (tsc --noEmit) proves the CHECKER sees `.ts` under `src`;
 *   - `npm test` proves BABEL strips the types and the result runs.
 * Remove `@babel/preset-typescript` and the test fails. Break `tsconfig.json`'s `include`, or drop
 * `isolatedModules`, and the typecheck stops meaning what it claims. Without a file like this the
 * E0 gate is green over zero TypeScript, which is indistinguishable from green over working
 * TypeScript right up until someone tries to convert something.
 *
 * DELETE THIS once real converted modules cover the same ground (E1 onwards) — at that point the
 * product's own `.ts` files are the guard, and this is redundant.
 */

export interface ToolchainProbe {
    label: string
    count: number
}

/** Re-exported with `export type` because `isolatedModules` requires type-only exports to say so. */
export type ToolchainLabel = ToolchainProbe['label']

export function identity<T> (value: T): T {
    return value
}

export function describe_ (probe: ToolchainProbe): string {
    return `${probe.label}:${probe.count}`
}
