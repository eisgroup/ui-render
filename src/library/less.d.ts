/**
 * `index.ts` imports the stylesheet for its side effect, and webpack's LESS rule compiles it. tsc has no
 * type for a stylesheet, and since TypeScript 6 it checks that every side-effect import resolves
 * (`noUncheckedSideEffectImports`), which is worth keeping: the engine's own side-effect imports
 * (`./mapper`, the form constants) register what it renders with. This declares the one kind of module
 * tsc cannot resolve.
 */
declare module '*.less'
