import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import { fileURLToPath } from 'url';
import webpack from 'webpack';

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
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
            'ui-modules-pack': path.resolve(__dirname, './src/core/modules'),
            'ui-react-pack': path.resolve(__dirname, './src/core/components'),
            'ui-utils-pack': path.resolve(__dirname, './src/core/utils')
        },
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new CopyPlugin({
            patterns: [
                { from: 'public/static', to: './static' },
                { from: 'public/static', to: '../static' },
            ],
        }),
    ]
};
