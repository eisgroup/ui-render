import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import LessPluginFunctions from 'less-plugin-functions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (env, argv) => {
    const isProduction = argv.mode === 'production';
    const envFile = isProduction ? '.env.production' : '.env.development';

    // Both overrides default to exactly today's values, so `npm start`, `npm run build` and
    // `npm run deploy` are unchanged. They exist for the Playwright leg (playwright.config.js),
    // which needs a ROOT-relative production build it can hand to a plain static server:
    // `/ui-render/` assets 404 unless the server mounts that prefix, which is why
    // `npm run serve-build` cannot serve the current build either. `REACT_APP_BASE_NAME` (read by
    // src/main.jsx via dotenv-webpack, where a system var wins over the .env file) is the router's
    // half of the same switch. OUTPUT_DIR keeps the e2e build out of `build/` so it cannot be
    // deployed to GitHub Pages by accident.
    const publicPath = process.env.PUBLIC_PATH || (isProduction ? '/ui-render/' : '/');
    const outputDir = process.env.OUTPUT_DIR || 'build';

    return {
        mode: isProduction ? 'production' : 'development',
        devtool: 'source-map',
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, outputDir),
            filename: isProduction
                ? 'static/js/[name].[contenthash:8].js'
                : 'static/js/[name].js',
            publicPath,
            clean: true,
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx|ts|tsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            // Presets and the decorators plugin come from the shared babel.config.js, which is
                            // also what the library build and jest use — a loader-level preset entry replaces
                            // the shared one for the same plugin identifier rather than adding to it, so
                            // duplicating them here silently overrode the config's own options. Only the
                            // demo-specific dev transform belongs inline.
                            plugins: isProduction ? [] : ['react-refresh/babel'],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                    ],
                },
                {
                    test: /\.less$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        {
                            loader: 'css-loader',
                            options: {
                                // Resolve url() so @font-face font files are emitted and work with style-loader (dev)
                                url: true,
                            },
                        },
                        'postcss-loader',
                        {
                            loader: 'less-loader',
                            options: {
                                lessOptions: {
                                    javascriptEnabled: true,
                                    // `theme.config` is aliased to our own copy in
                                    // `src/style/override/`, and that file does
                                    // `@import (multiple) "theme.less"` — which Less resolves
                                    // relative to the IMPORTING file, where no `theme.less` exists.
                                    // It only ever worked because `src/style/__tests__/setup.js`
                                    // copies `theme.config` into `node_modules/semantic-ui-less/`,
                                    // next to that package's own `theme.less`. So the build silently
                                    // depended on the CSS test suite having run first: in CI the
                                    // `verify` job happens to run `test:coverage` before `build`,
                                    // and the new browser job — `npm ci` straight to the build —
                                    // failed on a clean checkout. Giving Less the package directory
                                    // makes the build self-sufficient instead.
                                    paths: [
                                        path.resolve(__dirname, 'node_modules/semantic-ui-less'),
                                        path.resolve(__dirname, 'node_modules'),
                                    ],
                                    relativeUrls: false,
                                    plugins: [new LessPluginFunctions()],
                                },
                            },
                        },
                    ],
                },
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
                '../../theme.config$': path.resolve(__dirname, './src/style/override/theme.config'),
                process: 'process/browser',
            },
        },
        plugins: [
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
