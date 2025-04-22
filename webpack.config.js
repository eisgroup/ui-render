import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import Dotenv from 'dotenv-webpack'
import MiniCssExtractPlugin from 'mini-css-extract-plugin'
import { fileURLToPath } from 'url';
import LessPluginFunctions from 'less-plugin-functions'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'development',
    sourceMap: true,
    entry: './src/index',
    output: {
        publicPath: 'http://localhost:3100/',
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        port: 3100,
        historyApiFallback: true,
        client: {
            overlay: false,
        },
        hot: true,
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
        // plugins: [new TsconfigPathsPlugin()],
        alias: {
            'ui-modules-pack': path.resolve(__dirname, './src/core/modules'),
            'ui-react-pack': path.resolve(__dirname, './src/core/components'),
            'ui-utils-pack': path.resolve(__dirname, './src/core/utils'),
            '../../theme.config$': path.join(__dirname, './src/style/override/theme.config')
        },
        fallback: {
            "fs": false,
            "tls": false,
            "net": false,
            "path": "path-browserify",
            "zlib": false,
            "http": false,
            "https": false,
            "stream": false,
            "crypto": false,
        }
    },
    module: {
        rules: [
            { test: /\.json$/, type: 'json' },
            {
                test: /\.(ts|tsx|js|jsx)$/,
                loader: 'babel-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader', 'postcss-loader']
            },
            {
                test: /\.less$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    "css-loader",
                    'postcss-loader',
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                                math: 'always',
                                plugins: [
                                    // PrefixWrap('.ui-render'),
                                    new LessPluginFunctions()
                                ]
                            },
                        },
                    }
                ]
            },
            {
                test: /\.md$/,
                use: "raw-loader",
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new Dotenv(),
        new HtmlWebpackPlugin({
            template: './public/index.html',
        }),
    ],
}
