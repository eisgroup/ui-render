import fs from 'fs';
import path from 'path';
import CopyPlugin from 'copy-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import LessPluginFunctions from 'less-plugin-functions';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT_STATIC = path.resolve(__dirname, 'static');
const DIST_STATIC = path.resolve(__dirname, 'dist/static');

/** Point a `dist/static/` stylesheet at the single real copy in the root `static/` payload. */
function writeReExport (name) {
    fs.mkdirSync(DIST_STATIC, { recursive: true });
    fs.writeFileSync(
        path.join(DIST_STATIC, name),
        `/* Re-export: the real stylesheet and its assets ship once in the package root static/ folder. */\n`
        + `@import '../../static/${name}';\n`
    );
}

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
        moment: 'moment',
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
            '../../theme.config$': path.resolve(__dirname, './src/style/override/theme.config'),
        },
    },
    optimization: {
        minimizer: ['...', new CssMinimizerPlugin()],
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
            'process.env': JSON.stringify({ NODE_ENV: 'production' }),
        }),
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new MiniCssExtractPlugin({
            filename: 'static/all.css',
        }),
        {
            apply(compiler) {
                // `output.clean` only covers dist/. The root `static/` payload lives outside it, so wipe it here
                // or removed/renamed assets survive forever in the published tarball.
                const cleanRootStatic = (_compiler, callback) => {
                    fs.rmSync(ROOT_STATIC, { recursive: true, force: true });
                    fs.mkdirSync(ROOT_STATIC, { recursive: true });
                    callback();
                };
                compiler.hooks.beforeRun.tapAsync('CleanRootStatic', cleanRootStatic);
                compiler.hooks.watchRun.tapAsync('CleanRootStatic', cleanRootStatic);

                compiler.hooks.afterEmit.tapAsync('PostBuildCopy', async (compilation, callback) => {
                    // Assets ship exactly once, in the root `static/` payload hosts copy to their web root
                    // (FILE.PATH_IMAGES resolves to `<homepage>/static/images/`), and `dist/static/` re-exports
                    // the stylesheets so bundler imports of the dist path keep resolving.
                    for (const name of ['all.css', 'all.css.map']) {
                        const emitted = path.join(DIST_STATIC, name);
                        if (fs.existsSync(emitted)) fs.renameSync(emitted, path.join(ROOT_STATIC, name));
                    }
                    writeReExport('all.css');

                    // Compile font.less → font.css for publish
                    const less = (await import('less')).default;
                    const fontLess = fs.readFileSync(path.resolve(__dirname, 'src/style/font.less'), 'utf8');
                    const result = await less.render(fontLess, {
                        filename: path.resolve(__dirname, 'src/style/font.less'),
                        paths: [path.resolve(__dirname, 'src/style')],
                        relativeUrls: false,
                        javascriptEnabled: true,
                    });
                    fs.writeFileSync(path.join(ROOT_STATIC, 'font.css'), result.css);
                    writeReExport('font.css');

                    callback();
                });
            },
        },
        new CopyPlugin({
            patterns: [
                // The stub is empty, so both copies stay free: consumers may import either path.
                { from: 'src/style/semantic-stub.css', to: './static/semantic.css' },
                { from: 'src/style/semantic-stub.css', to: '../static/semantic.css' },
                { from: 'src/style/fonts/icons/fonts', to: '../static/fonts/icons/fonts', noErrorOnMissing: true },
                { from: 'public/static/images', to: '../static/images', noErrorOnMissing: true },
            ],
        }),
    ]
};
