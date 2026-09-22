import fs from 'fs';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import lessOptionsModule from './scripts/less-options.js';
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
        'react-dom': 'react-dom',
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { url: false },
                    },
                    'postcss-loader',
                    {
                        loader: 'less-loader',
                        options: {
                            lessOptions: lessOptions({ relativeUrls: false }),
                        },
                    },
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    optimization: {
        minimizer: ['...', new CssMinimizerPlugin()],
    },
    plugins: [
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
                // because that suite writes `override/_semantic.less` to measure what the imports
                // contribute — a source change, so the watcher rebuilt, so the directory was wiped.
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
                    // (FILE.PATH_IMAGES resolves to `<homepage>/static/images/`), and `dist/static/` re-exports
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
                // `flags/` IS library code's business and must stay: src/core/components/renders.js
                // renders country flags from `${FILE.PATH_IMAGES}flags/` at runtime. It is referenced
                // from JS, never from CSS, so no build step would have caught its removal — a missing
                // flag 404s in the host's browser, not here.
                { from: 'public/static/images/flags', to: '../static/images/flags', noErrorOnMissing: true },
            ],
        }),
    ]
};
