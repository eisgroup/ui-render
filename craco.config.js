const CracoLess = require('craco-less');
const CracoCSSModules = require('craco-css-modules');
const path = require('path');
const LessPluginFunctions = require('less-plugin-functions')
const PrefixWrap = require("postcss-prefixwrap");

module.exports = {
    webpack: {
        configure: webpackConfig => {
            const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
                ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
            );

            webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);

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