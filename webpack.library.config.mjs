import fs from 'fs';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
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
    optimization: {
        minimizer: ['...', new CssMinimizerPlugin()],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new MiniCssExtractPlugin({
            filename: 'static/all.css',
        }),
        {
            apply(compiler) {
                compiler.hooks.afterEmit.tapAsync('PostBuildCopy', async (compilation, callback) => {
                    // Copy all.css to root static/
                    const allSrc = path.resolve(__dirname, 'dist/static/all.css');
                    const allDest = path.resolve(__dirname, 'static/all.css');
                    if (fs.existsSync(allSrc)) fs.copyFileSync(allSrc, allDest);

                    // Compile font.less → font.css for publish
                    const less = (await import('less')).default;
                    const fontLess = fs.readFileSync(path.resolve(__dirname, 'src/style/font.less'), 'utf8');
                    const result = await less.render(fontLess, {
                        filename: path.resolve(__dirname, 'src/style/font.less'),
                        paths: [path.resolve(__dirname, 'src/style')],
                        relativeUrls: false,
                        javascriptEnabled: true,
                    });
                    fs.writeFileSync(path.resolve(__dirname, 'dist/static/font.css'), result.css);
                    fs.writeFileSync(path.resolve(__dirname, 'static/font.css'), result.css);

                    callback();
                });
            },
        },
        new CopyPlugin({
            patterns: [
                { from: 'src/style/semantic-stub.css', to: './static/semantic.css' },
                { from: 'src/style/semantic-stub.css', to: '../static/semantic.css' },
                { from: 'src/style/fonts/icons/fonts', to: './static/fonts', noErrorOnMissing: true },
                { from: 'src/style/fonts/icons/fonts', to: '../static/fonts', noErrorOnMissing: true },
                { from: 'public/static/images', to: './static/images', noErrorOnMissing: true },
                { from: 'public/static/images', to: '../static/images', noErrorOnMissing: true },
            ],
        }),
    ]
};
