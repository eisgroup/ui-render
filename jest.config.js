module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '^ui-modules-pack/(.*)$': '<rootDir>/src/core/modules/$1',
        '^ui-modules-pack$': '<rootDir>/src/core/modules',
        '^ui-react-pack/(.*)$': '<rootDir>/src/core/components/$1',
        '^ui-react-pack$': '<rootDir>/src/core/components',
        '^ui-utils-pack/(.*)$': '<rootDir>/src/core/utils/$1',
        '^ui-utils-pack$': '<rootDir>/src/core/utils',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
    },
    transformIgnorePatterns: [
        '<rootDir>/node_modules/(?!(lodash-es|flat|react-markdown|remark-gfm|remark-html|remark-toc|unified|remark-parse|bail|trough|vfile|unist-util-stringify-position|mdast-util-from-markdown|mdast-util-to-string|micromark|decode-named-character-reference|character-entities|mdast-util-to-hast|trim-lines|property-information|hast-util-whitespace|space-separated-tokens|comma-separated-tokens|devlop|ccount|escape-string-regexp|markdown-table|zwitch|longest-streak|hast-util-to-text)/)',
    ],
    setupFiles: ['<rootDir>/src/style/__tests__/setup.js'],
    testPathIgnorePatterns: ['/node_modules/', '<rootDir>/src/style/__tests__/setup.js'],
}
