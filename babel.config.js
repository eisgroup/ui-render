const isTest = process.env.NODE_ENV === 'test';

module.exports = {
    presets: [
        ["@babel/preset-env", isTest ? { targets: { node: "current" } } : {}],
        // The automatic runtime: JSX compiles to calls into `react/jsx-runtime` instead of
        // `React.createElement`. React 19 expects it, and every React the library supports ships
        // the runtime, from the 16.14 floor up. The library build lists `react/jsx-runtime` as an
        // external beside `react`, so a host's own React supplies it (webpack.library.config.mjs).
        ["@babel/preset-react", { runtime: "automatic" }],
        // Presets apply in REVERSE order, so listing TypeScript last makes it run FIRST: types are
        // stripped before preset-env and preset-react ever see the file. Any other position and they
        // would be handed syntax they cannot parse.
        //
        // This strips types, it does not check them — Babel compiles each file in isolation and has no
        // cross-file knowledge. `npm run typecheck` (tsc --noEmit) is what actually checks, and that is
        // why `isolatedModules` is on in tsconfig.json: it makes tsc reject the constructs whose meaning
        // depends on knowledge Babel does not have, so the two agree instead of quietly disagreeing.
        //
        // Pinned to the Babel 7 line deliberately: @babel/preset-typescript@8 peer-requires
        // @babel/core@^8, and this project is on core 7. Installing 8 here needs --legacy-peer-deps,
        // which would be papering over a real mismatch, not resolving it.
        "@babel/preset-typescript",
    ],
    ...(isTest ? {} : { include: ['src'] }),
};
