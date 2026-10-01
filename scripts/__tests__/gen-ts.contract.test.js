/**
 * THE DECLARATION GENERATOR'S CONTRACT (§9.6-E4) ==============================
 *
 * `scripts/gen-ts.js` writes `dist/index.d.ts` from the declaration tsc emits for
 * `src/library/main.tsx`, and publishes the contract's as `dist/contract.d.ts`.
 * `npm run test:types` proves the published result compiles for every supported
 * `@types/react`. This suite proves the generator REFUSES what it must never
 * publish, without running tsc: each case is a declaration file written here, in
 * the shape tsc would emit for a source that broke one rule.
 */
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const { contractExports, entryParts, writeIndex } = require('../gen-ts')

const parse = text => ts.createSourceFile('fixture.d.ts', text, ts.ScriptTarget.Latest, true)

const CONTRACT = [
    "import * as React from 'react';",
    'export interface UIRenderProps<Data = unknown> { data: Data; style?: React.CSSProperties; }',
    "export type MetaView = 'Row' | (string & {});",
    '',
].join('\n')

const ENTRY = [
    "import * as React from 'react';",
    "import type { UIRenderProps } from './contract';",
    '/** The component. */',
    'declare function Render<Data = unknown>(props: UIRenderProps<Data>): React.ReactElement | null;',
    'export default Render;',
    '',
].join('\n')

describe('scripts/gen-ts.js', () => {
    it('publishes the default export as UIRender, with every contract type in its namespace', () => {
        const index = writeIndex(entryParts(parse(ENTRY)), contractExports(parse(CONTRACT)))

        expect(index).toContain([
            '/** The component. */',
            'declare function UIRender<Data = unknown>(props: UIRenderProps<Data>): React.ReactElement | null;',
        ].join('\n'))
        expect(index).toContain('    export import UIRenderProps = Contract.UIRenderProps;')
        expect(index).toContain('    export import MetaView = Contract.MetaView;')
        expect(index).toContain("import * as Contract from './contract';")
        expect(index.trimEnd().endsWith('export = UIRender;')).toBe(true)
        // Renamed everywhere: the source's own name is not part of the published surface.
        expect(index).not.toMatch(/\bRender\b/)
    })

    it('imports react by namespace, whatever form the declaration used', () => {
        // A default import of `react` compiles only with `esModuleInterop`, which a host need not set.
        const { imports } = entryParts(parse(ENTRY.replace("import * as React from 'react';", "import React from 'react';")))

        expect(imports).toContain("import * as React from 'react';")
        expect(imports).not.toContain("import React from 'react';")
    })

    // The published surface, counted. A new type is a change to the public API, and this is where
    // a review sees it; the generator itself would publish it without a word.
    it('accepts the real contract, and publishes its 27 types', () => {
        const file = path.resolve(__dirname, '../../src/library/contract.ts')
        const names = contractExports(ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true))

        expect(names).toHaveLength(27)
        expect(names).toEqual(expect.arrayContaining(['UIRenderProps', 'Meta', 'MetaNode', 'UIRenderErrorReport']))
    })

    it.each([
        ['an import of another module', `${CONTRACT}import { Other } from './other';\n`, /may import 'react' only/],
        ['an exported value', `${CONTRACT}export declare const helper: () => void;\n`, /exported types only/],
        ['an exported function', `${CONTRACT}export declare function helper(): void;\n`, /exported types only/],
        ['an exported enum', `${CONTRACT}export declare enum Kind { A }\n`, /exported types only/],
        ['a type it does not export', `${CONTRACT}interface Hidden { a: 1 }\n`, /exported types only/],
    ])('refuses a contract with %s', (_, text, message) => {
        expect(() => contractExports(parse(text))).toThrow(message)
    })

    it('refuses a contract that exports no type', () => {
        expect(() => contractExports(parse("import * as React from 'react';\n"))).toThrow(/exports no types/)
    })

    it.each([
        [
            'imports a module other than react and the contract',
            ENTRY.replace("from './contract'", "from '../core/engine/rules'"),
            /may import 'react' and '\.\/contract' only/,
        ],
        [
            'exports a const',
            "import type { UIRenderProps } from './contract';\ndeclare const Render: (props: UIRenderProps) => null;\nexport default Render;\n",
            /found VariableStatement/,
        ],
        ['exports a type besides the component', `${ENTRY}export type Extra = string;\n`, /found TypeAliasDeclaration/],
        ['has no default export', ENTRY.replace('export default Render;\n', ''), /no `export default`/],
        ['declares a function it does not export', `${ENTRY}declare function helper(): void;\n`, /does not export by default/],
        [
            'imports names from react',
            ENTRY.replace("import * as React from 'react';", "import { ReactElement } from 'react';"),
            /as something other than one name/,
        ],
    ])('refuses a component declaration that %s', (_, text, message) => {
        expect(() => entryParts(parse(text))).toThrow(message)
    })
})
