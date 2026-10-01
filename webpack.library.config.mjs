import fs from 'fs';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import lessOptionsModule from './scripts/less-options.js';
import { sourceRules } from './webpack.common.mjs'
const { lessOptions } = lessOptionsModule;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT_STATIC = path.resolve(__dirname, 'static');
const DIST_STATIC = path.resolve(__dirname, 'dist/static');

/** Point a `dist/static/` stylesheet at the single real copy in the root `static/` payload. */
function writeReExport (name) {
    fs.mkdirSync(DIST_STATIC, { recursive: true });
    fs.writeFileSync(
        path.join(DIST_STATIC, name),
        `/* Re-export: the real stylesheet and its assets ship once in the package root static/ folder. */\n`
        + `@import '../../static/${name}';\n`
    );
}

export default {
    mode: 'production',
    devtool: 'source-map',
    entry: './src/library/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        library: {
            name: 'UIRender',
            type: 'umd',
            export: 'default',
        },
        globalObject: 'this',
        // `keep` rather than a bare `true`, and it is what makes `watch-lib` usable: webpack owns
        // `dist/index.js`, but `dist/*.d.ts` come from `tsc` in a separate step. A plain clean
        // wipes them on every rebuild, and in watch mode nothing regenerates them — measured, a
        // watch session left `dist` with ZERO declaration files after `build-lib` had produced two.
        // For `build-lib` this changes nothing: `gen-ts` runs immediately after and rewrites them.
        clean: { keep: /\.d\.ts$/ },
    },
    externals:{
        moment: 'moment',
        react: 'react',
        // What the automatic JSX runtime compiles to (babel.config.js). External for the same reason
        // `react` is: bundled, it would be this repository's React 18 copy, creating elements through
        // internals that belong to a different React than the host renders them with.
        'react/jsx-runtime': 'react/jsx-runtime',
        'react-dom': 'react-dom',
    },
    module: {
        // §9.9-H7: the three source rules live in webpack.common.mjs. `cssUrl: false` is the
        // library's half of the one difference that matters — its fonts and images ship once in the
        // root `static/` payload, so css-loader must NOT resolve url() and re-emit them into dist/.
        rules: sourceRules({ styleLoader: MiniCssExtractPlugin.loader, cssUrl: false }, lessOptions),
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    optimization: {
        minimizer: ['...', new CssMinimizerPlugin()],
    },
    plugins: [
        // DELIBERATE: the library's environment is fixed when it is built. `process.env` becomes the
        // literal {NODE_ENV: 'production'} and `process` the bundled process/browser shim, so
        // src/core/utils/_envs.ts sees __PROD__ true and nothing else in every host — a host's own
        // define, EnvironmentPlugin, shell variable or runtime `process` cannot reach it (measured
        // through webpack, esbuild and Vite hosts and a Node server render). Releases whose output
        // still read a live `process.env` (0.30.23–0.32.3) behaved differently per host, and crashed
        // on a minimal `process` shim with no cwd(). Anything that must vary per host needs a runtime
        // option, not an env variable: see the homepage guard in src/core/common/variables/index.js.
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env': JSON.stringify({ NODE_ENV: 'production' }),
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new MiniCssExtractPlugin({
            filename: 'static/all.css',
        }),
        {
            apply(compiler) {
                // `output.clean` only covers dist/. The root `static/` payload lives outside it, so wipe it here
                // or removed/renamed assets survive forever in the published tarball.
                const cleanRootStatic = (_compiler, callback) => {
                    fs.rmSync(ROOT_STATIC, { recursive: true, force: true });
                    fs.mkdirSync(ROOT_STATIC, { recursive: true });
                    callback();
                };
                // ONLY ON A ONE-SHOT BUILD, deliberately not on every watch rebuild.
                //
                // `cleanRootStatic` empties the root `static/` payload so a renamed or removed asset
                // cannot linger; `PostBuildCopy` below refills it. Between those two moments the
                // directory is EMPTY, which is harmless for `build-lib` — it runs once and nothing
                // else is looking — and a real hazard under `--watch`, where every source change
                // reopens that window.
                //
                // Measured rather than theorised, after it cost an afternoon: with a watcher running,
                // `css.semantic-parity.test.js` emptied `static/` on every run (6 files -> 0),
                // because that suite wrote `override/_semantic.less` to measure what the imports
                // contribute — a source change, so the watcher rebuilt, so the directory was wiped.
                // (It measures in memory since 2026-09-30; any source edit still reopens the window.)
                // Three tests in `css.pipeline.parity.test.js` then failed on a file that had existed
                // moments earlier. The failure looks nothing like its cause: no `fs` probe inside jest
                // ever fires, because the deletion is in another process.
                //
                // In watch mode the outputs are overwritten on every rebuild anyway, so skipping the
                // wipe costs only the chance of a stale file from a rename — which one `build-lib`
                // clears — and buys a `static/` that is never momentarily absent.
                compiler.hooks.beforeRun.tapAsync('CleanRootStatic', cleanRootStatic);

                compiler.hooks.afterEmit.tapAsync('PostBuildCopy', async (compilation, callback) => {
                    // Assets ship exactly once, in the root `static/` payload hosts copy to their web root
                    // (a name-only Image loads from `/static/images/<name>`), and `dist/static/` re-exports
                    // the stylesheets so bundler imports of the dist path keep resolving.
                    for (const name of ['all.css', 'all.css.map']) {
                        const emitted = path.join(DIST_STATIC, name);
                        if (fs.existsSync(emitted)) fs.renameSync(emitted, path.join(ROOT_STATIC, name));
                    }
                    writeReExport('all.css');

                    // Compile font.less → font.css for publish
                    const less = (await import('less')).default;
                    const fontLess = fs.readFileSync(path.resolve(__dirname, 'src/style/font.less'), 'utf8');
                    const result = await less.render(fontLess, {
                        filename: path.resolve(__dirname, 'src/style/font.less'),
                        ...lessOptions({
                            // `paths` stays local: this compile is `font.less` alone, so it needs
                            // only our own style directory, not the whole resolution chain.
                            paths: [path.resolve(__dirname, 'src/style')],
                            relativeUrls: false,
                        }),
                    });
                    fs.writeFileSync(path.join(ROOT_STATIC, 'font.css'), result.css);
                    writeReExport('font.css');

                    callback();
                });
            },
        },
        new CopyPlugin({
            patterns: [
                // The stub is empty, so both copies stay free: consumers may import either path.
                { from: 'src/style/semantic-stub.css', to: './static/semantic.css' },
                { from: 'src/style/semantic-stub.css', to: '../static/semantic.css' },
                { from: 'src/style/fonts/icons/fonts', to: '../static/fonts/icons/fonts', noErrorOnMissing: true },
                // ONLY `flags/`, not the whole folder. The rest of public/static/images is
                // documentation for the GitHub Pages demo — four screenshots referenced from
                // src/demo/markdowns/*.md, plus `home.jpg`/`diamonds-dimmed.png` whose only mentions
                // are COMMENTED-OUT LESS rules, and `logo.svg`, which is merely the default argument
                // of the `.background-image()` mixin that every live call overrides. None of it is
                // reachable from the library, and shipping it put 1,042 KB of docs in every host's
                // node_modules.
                //
                // `flags/` was kept for `languageDropdownOptions` in src/core/components/renders, which
                // rendered country flags from `${FILE.PATH_IMAGES}flags/` and was tree-shaken out of
                // dist ('flags/' occurs 0 times). That renderer was dead code and is deleted (§9.6-E2,
                // seventh batch), so nothing in the library references these files now. They still
                // ship: no longer shipping a folder that hosts may copy is a decision about the
                // package, and it is recorded as open in docs/UPGRADE-PLAN.md rather than taken here.
                { from: 'public/static/images/flags', to: '../static/images/flags', noErrorOnMissing: true },
            ],
        }),
    ]
};
