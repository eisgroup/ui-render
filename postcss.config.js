export default {
    plugins: [
        require('postcss-prefixwrap')('.ui-render', {ignoredSelectors: [/^\.ui-render-(.+)$/]})
    ]
}