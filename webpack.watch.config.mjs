import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import LessPluginFunctions from 'less-plugin-functions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        clean: true,
    },
    externals:{
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
                    'css-loader',
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
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                type: 'asset/resource',
                generator: {
                    filename: 'static/fonts/[name][ext]',
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
            'ui-modules-pack': path.resolve(__dirname, './src/core/modules'),
            'ui-react-pack': path.resolve(__dirname, './src/core/components'),
            'ui-utils-pack': path.resolve(__dirname, './src/core/utils'),
            '../../theme.config$': path.resolve(__dirname, './src/style/override/theme.config'),
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new MiniCssExtractPlugin({
            filename: 'static/ui-render.css',
        }),
        new CopyPlugin({
            patterns: [
                { from: 'src/style/fonts/icons/fonts', to: './static/fonts/icons/fonts', noErrorOnMissing: true },
                { from: 'public/static/images', to: './static/images', noErrorOnMissing: true },
                { from: 'src/style/fonts/icons/fonts', to: '../static/fonts/icons/fonts', noErrorOnMissing: true },
                { from: 'public/static/images', to: '../static/images', noErrorOnMissing: true },
            ],
        }),
    ]
};
