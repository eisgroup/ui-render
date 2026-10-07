const isTest = process.env.NODE_ENV === 'test';

module.exports = {
    presets: [
        ["@babel/preset-env", isTest ? { targets: { node: "current" } } : {}],
        // The automatic runtime: JSX compiles to calls into `react/jsx-runtime` instead of
        // `React.createElement`. React 19 expects it, and every React the library supports ships
        // the runtime, from the 16.14 floor up. The library build lists `react/jsx-runtime` as an
        // external beside `react`, so a host's own React supplies it (webpack.library.config.mjs).
        //
        // `development: false` keeps the production runtime in every build, as Babel 7 did by default.
        // Babel 8 switches to the development runtime whenever its env is "development", which it is in any
        // process without NODE_ENV: the library build then called `jsxDEV`, which React's production
        // `jsx-dev-runtime` leaves undefined, and the packed bundle failed to render (measured).
        ["@babel/preset-react", { runtime: "automatic", development: false }],
        // Presets apply in REVERSE order, so listing TypeScript last makes it run FIRST: types are
        // stripped before preset-env and preset-react ever see the file. Any other position and they
        // would be handed syntax they cannot parse.
        //
        // This strips types, it does not check them — Babel compiles each file in isolation and has no
        // cross-file knowledge. `npm run typecheck` (tsc --noEmit) is what actually checks, and that is
        // why `isolatedModules` is on in tsconfig.json: it makes tsc reject the constructs whose meaning
        // depends on knowledge Babel does not have, so the two agree instead of quietly disagreeing.
        //
        // `onlyRemoveTypeImports: false` is Babel 7's behaviour: an import whose bindings are only used as
        // types goes, `type` keyword or not. Babel 8 keeps such an import, and so evaluates its module, which
        // is safe only where tsconfig's `verbatimModuleSyntax` makes `type` mandatory; it is not on here. The
        // engine's modules import each other in a cycle (CLAUDE.md, Gotchas): an import kept could change
        // what is defined when.
        ["@babel/preset-typescript", { onlyRemoveTypeImports: false }],
    ],
    ...(isTest ? {} : { include: ['src'] }),
};
