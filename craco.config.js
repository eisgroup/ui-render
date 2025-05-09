const path = require('path');

module.exports = {
    webpack: {
        configure: webpackConfig => {
            const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
                ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
            );

            webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
            webpackConfig.devtool = 'source-map'

            return webpackConfig;
        },
        alias: {
            'ui-modules-pack': path.resolve(__dirname, './src/core/modules'),
            'ui-react-pack': path.resolve(__dirname, './src/core/components'),
            'ui-utils-pack': path.resolve(__dirname, './src/core/utils'),
            '../../theme.config$': path.join(__dirname, './src/style/override/theme.config')
        },
    },
    babel: {
        presets: ["@babel/preset-react"],
        plugins: [["@babel/plugin-proposal-decorators", { "legacy": true }]],
        include: [path.resolve(__dirname)],
    }
}