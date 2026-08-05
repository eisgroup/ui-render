const isTest = process.env.NODE_ENV === 'test';

module.exports = {
    presets: [
        ["@babel/preset-env", isTest ? { targets: { node: "current" } } : {}],
        "@babel/preset-react",
    ],
    plugins: [["@babel/plugin-proposal-decorators", { "legacy": true }]],
    ...(isTest ? {} : { include: ['src'] }),
};
