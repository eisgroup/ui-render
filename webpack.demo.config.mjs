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

    return {
        mode: isProduction ? 'production' : 'development',
        devtool: 'source-map',
        entry: './src/index.js',
        output: {
            path: path.resolve(__dirname, 'build'),
            filename: isProduction
                ? 'static/js/[name].[contenthash:8].js'
                : 'static/js/[name].js',
            publicPath: isProduction ? '/ui-render/' : '/',
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
