import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import lessOptionsModule from './scripts/less-options.js';
import floors from './scripts/fixtures/react-legacy/floors.js';
import fixturePackagesModule from './scripts/fixtures/react-legacy/packages.js';
import { sourceRules } from './webpack.common.mjs'
const { lessOptions } = lessOptionsModule;
const { fixturePackages } = fixturePackagesModule;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * `REACT_FIXTURE=react19` builds the demo on a per-React jest leg's fixture install (scripts/fixtures/react-legacy/
 * floors.js) instead of the installed React 18: playwright.react19.config.js sets it for the browser leg on React 19.
 * Unset, nothing changes. The fixture's versions are checked as the jest legs check them, so a broken install cannot
 * fall back to 18 unnoticed, and only a fixture with `react-dom/client` will do: the demo mounts through `createRoot`.
 */
function reactAliases (name) {
    if (!name) return {};
    const floor = floors[name];
    if (!floor) throw new Error(`REACT_FIXTURE=${name} names no fixture in scripts/fixtures/react-legacy/floors.js`);
    if (floor.legacyRoot) {
        throw new Error(`REACT_FIXTURE=${name}: ${floor.name} has no react-dom/client, and the demo mounts through createRoot`);
    }
    const { react, reactDom, scheduler } = fixturePackages(floor);
    return { react, 'react-dom': reactDom, scheduler };
}

export default (env, argv) => {
    const isProduction = argv.mode === 'production';
    const envFile = isProduction ? '.env.production' : '.env.development';

    // Both overrides default to exactly today's values, so `npm start`, `npm run build` and
    // `npm run deploy` are unchanged. They exist for the Playwright leg (playwright.config.js),
    // which needs a ROOT-relative production build it can hand to a plain static server:
    // `/ui-render/` assets 404 unless the server mounts that prefix, which is why
    // `npm run serve-build` cannot serve the current build either. `REACT_APP_BASE_NAME` (read by
    // src/demo/main.jsx via dotenv-webpack, where a system var wins over the .env file) is the router's
    // half of the same switch. OUTPUT_DIR keeps the e2e build out of `build/` so it cannot be
    // deployed to GitHub Pages by accident.
    const publicPath = process.env.PUBLIC_PATH || (isProduction ? '/ui-render/' : '/');
    const outputDir = process.env.OUTPUT_DIR || 'build';
    // The base the demo's assets are served under IS its homepage, so it is derived here rather than
    // configured a second time: `/ui-render/` -> `/ui-render`, `/` -> ''. src/core/utils/_envs.ts reads it
    // as the literal `process.env.REACT_APP_HOMEPAGE`, which is what lets this define reach it at all, and
    // FILE.PATH_IMAGES and ROUTE_BASE follow it — the GitHub Pages build then asks for its images under
    // /ui-render/static/images/, where CopyPlugin puts them. Registered BEFORE Dotenv on purpose: webpack
    // keeps the first define of a key and only warns, so a REACT_APP_HOMEPAGE exported in the build shell
    // cannot silently move the demo's images (measured both orders).
    const homepage = publicPath.replace(/\/$/, '');

    return {
        mode: isProduction ? 'production' : 'development',
        devtool: 'source-map',
        entry: './src/demo/index.js',
        output: {
            path: path.resolve(__dirname, outputDir),
            filename: isProduction
                ? 'static/js/[name].[contenthash:8].js'
                : 'static/js/[name].js',
            publicPath,
            clean: true,
        },
        module: {
            // §9.9-H7: the three source rules live in webpack.common.mjs. The demo's half of the
            // differences: `style-loader` in dev so styles hot-reload, `cssUrl: true` so @font-face
            // files are emitted and resolve under style-loader, and the one dev-only babel plugin.
            rules: [
                ...sourceRules({
                    styleLoader: isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                    cssUrl: true,
                    babelPlugins: isProduction ? [] : ['react-refresh/babel'],
                }, lessOptions),
                {
                    test: /\.md$/,
                    type: 'asset/resource',
                },
                {
                    test: /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|eot|ttf|otf)$/,
                    type: 'asset/resource',
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
            alias: {
                process: 'process/browser',
                ...reactAliases(process.env.REACT_FIXTURE),
            },
        },
        plugins: [
            new webpack.DefinePlugin({ 'process.env.REACT_APP_HOMEPAGE': JSON.stringify(homepage) }),
            new Dotenv({ path: envFile, systemvars: true }),
            new HtmlWebpackPlugin({
                template: './public/index.html',
                favicon: './public/favicon.ico',
            }),
            new CopyPlugin({
                patterns: [
                    { from: 'public/static', to: 'static' },
                    { from: 'public/manifest.json', to: '', noErrorOnMissing: true },
                ],
            }),
            ...(isProduction
                ? [new MiniCssExtractPlugin({ filename: 'static/[name].[contenthash:8].css' })]
                : [new ReactRefreshWebpackPlugin()]),
        ],
        devServer: {
            port: 3001,
            hot: true,
            historyApiFallback: true,
            static: [
                { directory: path.resolve(__dirname, 'public') },
                { directory: path.resolve(__dirname, 'public/static'), publicPath: '/' },
            ],
        },
        optimization: isProduction
            ? { splitChunks: { chunks: 'all' } }
            : undefined,
    };
};
