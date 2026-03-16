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
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                            plugins: [
                                ['@babel/plugin-proposal-decorators', { legacy: true }],
                                ...(!isProduction ? ['react-refresh/babel'] : []),
                            ],
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
                            options: { url: false },
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
                'ui-modules-pack': path.resolve(__dirname, './src/core/modules'),
                'ui-react-pack': path.resolve(__dirname, './src/core/components'),
                'ui-utils-pack': path.resolve(__dirname, './src/core/utils'),
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
                ? [new MiniCssExtractPlugin({ filename: 'static/css/[name].[contenthash:8].css' })]
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
