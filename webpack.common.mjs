/**
 * The loader chain both builds share (§9.9-H7).
 *
 * WHY A FUNCTION AND NOT AN OBJECT. The two builds differ in exactly three places, and each
 * difference is a decision with a reason — so they are parameters, stated here once, rather than two
 * hand-maintained copies that happen to agree until someone edits one of them. Everything else about
 * these three rules is identical and now has a single definition.
 *
 * WHAT IS DELIBERATELY *NOT* HERE: entry, output, externals, plugins, devServer, optimization and the
 * demo's `.md`/asset rules. Sharing those is what produced `webpack.watch.config.mjs`, the third
 * config that drifted into emitting the wrong stylesheet name and no type declarations at all, and
 * whose fix (2026-09-15) was DELETION rather than unification. A shared core plus two explicit
 * targets is the shape that cannot drift; a shared everything is the shape that already did.
 */

/**
 * @param {Object} o
 * @param {String|Object} o.styleLoader - `MiniCssExtractPlugin.loader` for a file, `style-loader` for
 *   dev injection. The demo swaps by mode; the library always extracts.
 * @param {Boolean} o.cssUrl - whether `css-loader` resolves `url()`. LOAD-BEARING AND OPPOSITE in the
 *   two builds: the demo needs `true` so `@font-face` files are emitted and work under `style-loader`;
 *   the library needs `false` because its fonts and images ship separately in the root `static/`
 *   payload and a resolved `url()` would inline or re-emit them into `dist/`, breaking the
 *   "assets ship once" guarantee the packaging budget enforces.
 * @param {Array} [o.babelPlugins] - loader-level plugins. ONLY demo-specific dev transforms belong
 *   here (`react-refresh/babel`). Never presets: a loader-level entry REPLACES the shared
 *   `babel.config.js` one for the same identifier instead of adding to it, which silently drops the
 *   shared options — the reason that config is the single source for presets in all three pipelines.
 */
export function sourceRules ({ styleLoader, cssUrl, babelPlugins = [] }, lessOptions) {
    return [
        {
            test: /\.(js|jsx|ts|tsx)$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: { plugins: babelPlugins },
            },
        },
        {
            test: /\.css$/,
            use: [styleLoader, 'css-loader'],
        },
        {
            test: /\.less$/,
            use: [
                styleLoader,
                { loader: 'css-loader', options: { url: cssUrl } },
                'postcss-loader',
                { loader: 'less-loader', options: { lessOptions: lessOptions({ relativeUrls: false }) } },
            ],
        },
    ]
}
