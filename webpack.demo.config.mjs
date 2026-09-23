import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import Dotenv from 'dotenv-webpack';
import lessOptionsModule from './scripts/less-options.js';
import { sourceRules } from './webpack.common.mjs'
const { lessOptions } = lessOptionsModule;

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
