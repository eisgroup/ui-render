export default {
    presets: ["@babel/preset-env", "@babel/preset-react"],
    plugins: [["@babel/plugin-proposal-decorators", { "legacy": true }]],
    include: ['src']
};