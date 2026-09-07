module.exports = {
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|svg|eot|otf|webp|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/src/__mocks__/fileMock.js',
    },
    transformIgnorePatterns: [
        '<rootDir>/node_modules/(?!(react-markdown|remark-gfm|remark-toc|unified|remark-parse|bail|trough|vfile|unist-util-stringify-position|mdast-util-from-markdown|mdast-util-to-string|micromark|decode-named-character-reference|character-entities|mdast-util-to-hast|trim-lines|property-information|hast-util-whitespace|space-separated-tokens|comma-separated-tokens|devlop|ccount|escape-string-regexp|markdown-table|zwitch|longest-streak|hast-util-to-text)/)',
    ],
    setupFiles: ['<rootDir>/src/style/__tests__/setup.js'],
    modulePathIgnorePatterns: ['<rootDir>/\\.[^/]+/worktrees/'],
    // `<rootDir>/e2e/` is the Playwright leg (playwright.config.js). Jest's `roots` is the repo
    // root and its default testMatch claims `**/__tests__/**`, `**/*.spec.js` and `**/*.test.js`,
    // so a browser spec named by either convention would be collected here and fail on the first
    // `@playwright/test` import. The files are named `*.pw.js` as well, so both halves of the fence
    // stand alone; the legacy React legs inherit this list by spreading this config
    // (scripts/fixtures/react-legacy/jest-config.js), so one entry covers all three.
    testPathIgnorePatterns: [
        '/node_modules/',
        '<rootDir>/e2e/',
        '<rootDir>/\\.[^/]+/worktrees/',
        '<rootDir>/src/style/__tests__/setup.js',
    ],
    collectCoverageFrom: [
        '<rootDir>/src/core/**/*.{js,jsx}',
        '<rootDir>/src/library/**/*.{js,jsx}',
        '!<rootDir>/src/**/__tests__/**',
        '!<rootDir>/src/**/*.test.{js,jsx}',
        '!<rootDir>/src/**/__mocks__/**',
    ],
    coverageThreshold: {
        global: {
            statements: 89,
            branches: 79,
            functions: 85,
            lines: 90,
        },
        './src/core/pages/main/rules.js': {
            statements: 89,
            branches: 76,
            functions: 98,
            lines: 91,
        },
        './src/core/pages/main/mapper.js': {
            statements: 98,
            branches: 93,
            functions: 100,
            lines: 99,
        },
        './src/core/modules/form/utils.js': {
            statements: 100,
            branches: 93,
            functions: 100,
            lines: 100,
        },
        './src/core/ui-render/transforms.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/components/Tabs.js': {
            statements: 100,
            branches: 94,
            functions: 100,
            lines: 100,
        },
        './src/core/components/Dropdown.js': {
            statements: 100,
            branches: 99,
            functions: 100,
            lines: 100,
        },
        // In-house since §9.7-F1 step 1. The wrapper it replaced had no entry here because it was
        // 24 lines of passthrough; the implementation is the table markup contract now, so it gets
        // the same floor as the other in-house components. Measured, not aspirational.
        './src/core/components/Table.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        // §9.7-F1 step 2 part 1. Added at 100/100/100/100 because that is what a `--coverage` run
        // measures, BEFORE the step as well as after — the old SUIR-mocked suite already reached
        // every line and the single `isFunction(title)` branch of a 24-line passthrough. So read
        // this entry for exactly what it is: a floor for the in-house tooltip part 2 puts at this
        // path, not evidence that the tooltip works. The gate for that is behavioural
        // (`TooltipPop.behavior.test.js`, `UIRender.overlay-behavior.test.js`) and markup-level
        // (`TooltipPop.test.js`, `style/__tests__/css.tooltip-contract.test.js`); a threshold here
        // would have stayed green through a wrapper that rendered nothing at all.
        './src/core/components/TooltipPop.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/modules/form/asInputDateField.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/pages/main/components/TableView.js': {
            statements: 100,
            branches: 97,
            functions: 100,
            lines: 100,
        },
        './src/core/pages/main/components/Tabs.js': {
            statements: 100,
            branches: 98,
            functions: 100,
            lines: 100,
        },
        './src/core/components/InputNumber.js': {
            statements: 98,
            branches: 94,
            functions: 100,
            lines: 100,
        },
        './src/core/components/Slider.js': {
            statements: 99,
            branches: 96,
            functions: 100,
            lines: 100,
        },
        './src/core/providers/AppProvider.jsx': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/library/AppWrapper.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/library/main.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/modules/form/views/AutoSave.js': {
            statements: 100,
            branches: 93,
            functions: 100,
            lines: 100,
        },
        './src/core/ui-render/Render.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/ui-render/validateMeta.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/ui-render/metaPath.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/providers/ConfigOverride.jsx': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/modules/upload/views/Upload.js': {
            statements: 100,
            branches: 97,
            functions: 100,
            lines: 100,
        },
        './src/core/components/InputNative.js': {
            statements: 98,
            branches: 94,
            functions: 100,
            lines: 100,
        },
        './src/core/components/Expand.js': {
            statements: 97,
            branches: 95,
            functions: 100,
            lines: 100,
        },
        './src/core/components/Dropzone.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/pages/main/dataKindPush.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/pages/main/components/LocalDraftTableRow.js': {
            statements: 99,
            branches: 93,
            functions: 100,
            lines: 100,
        },
        './src/core/components/InputDate.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/components/ProgressSteps.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/components/ScrollView.js': {
            statements: 100,
            branches: 90,
            functions: 100,
            lines: 100,
        },
        './src/core/utils/storage.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/utils/function.js': {
            statements: 100,
            branches: 96,
            functions: 77,
            lines: 100,
        },
        './src/core/components/Counter.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/components/Input.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/modules/form/inputs/ToggleField.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/components/JsonView/index.js': {
            statements: 100,
            branches: 93,
            functions: 100,
            lines: 100,
        },
        './src/core/components/Pagination.js': {
            statements: 100,
            branches: 94,
            functions: 100,
            lines: 100,
        },
        './src/core/components/Checkbox.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/components/ProgressBar.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
        './src/core/utils/definitions.js': {
            statements: 100,
            branches: 100,
            functions: 100,
            lines: 100,
        },
    },
}
