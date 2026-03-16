module.exports = {
    plugins: [
        require('postcss-prefixwrap')('.ui-render', {ignoredSelectors: [/^\.ui-render-(.+)$/, /^html$/, /^body$/, /^\*$/]})
    ]
}
