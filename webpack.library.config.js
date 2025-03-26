import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

export default {
    mode: 'production',
    devtool: 'source-map',
    entry: './src/library/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js',
        // library: 'UIRender',
        libraryTarget: 'module',
    },
    // Ensure ES module output
    experiments: {
        outputModule: true, // Enable module output
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
        new CopyPlugin({
            patterns: [
                { from: 'public/static', to: './static' },
                { from: 'package.json', to: './' },
            ],
        }),
    ]
};
