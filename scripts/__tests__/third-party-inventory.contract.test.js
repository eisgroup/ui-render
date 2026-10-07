/**
 * @jest-environment node
 */
/**
 * THE THIRD-PARTY INVENTORY'S CONTRACT ========================================
 *
 * `scripts/third-party-inventory.js` writes `dist/THIRD-PARTY-LICENSES.txt` and `dist/sbom.cdx.json`
 * from the chunks webpack emits, and `npm run test:pack` proves that both ship. This suite proves what
 * they hold. Each webpack case compiles a fixture tree written here, so none depends on what happens to
 * be installed.
 */
const fs = require('fs')
const os = require('os')
const path = require('path')
const webpack = require('webpack')

const {
    ThirdPartyInventoryPlugin,
    VENDORED_CSS,
    bundledPackages,
    packageRootOf,
    sbomOf,
} = require('../third-party-inventory')

const MIT = holder => `MIT License\n\nCopyright (c) 2026 ${holder}\n\nPermission is hereby granted, free of charge.\n`

const ROOT = { name: 'host-library', version: '1.0.0', license: 'Apache-2.0' }

/**
 * A library that bundles two packages, one of which bundles a nested copy of a third. It also imports
 * a side-effect-free package and uses nothing from it, so webpack builds that one and leaves it out.
 */
const FIXTURE = {
    'entry.js': [
        "import used from 'used-package'",
        "import scoped from '@scope/scoped-package'",
        "import { unused } from 'unused-package'",
        'export default [used(), scoped()]',
        '',
    ].join('\n'),
    'node_modules/used-package/package.json': { name: 'used-package', version: '1.2.3', license: 'MIT', main: 'index.js' },
    'node_modules/used-package/index.js': "const nested = require('nested-package')\nmodule.exports = () => 'used ' + nested\n",
    'node_modules/used-package/LICENSE': MIT('Used Author'),
    'node_modules/used-package/node_modules/nested-package/package.json': { name: 'nested-package', version: '2.0.0', license: 'MIT', main: 'index.js' },
    'node_modules/used-package/node_modules/nested-package/index.js': "module.exports = 'nested 2'\n",
    'node_modules/used-package/node_modules/nested-package/LICENSE': MIT('Nested Author'),
    'node_modules/nested-package/package.json': { name: 'nested-package', version: '1.0.0', license: 'MIT', main: 'index.js' },
    'node_modules/nested-package/index.js': "module.exports = 'nested 1'\n",
    'node_modules/nested-package/LICENSE': MIT('Hoisted Author'),
    'node_modules/@scope/scoped-package/package.json': { name: '@scope/scoped-package', version: '0.1.0', license: '(MIT OR Apache-2.0)', main: 'index.js' },
    'node_modules/@scope/scoped-package/index.js': "module.exports = () => 'scoped'\n",
    'node_modules/@scope/scoped-package/LICENSE.md': MIT('Scoped Author'),
    'node_modules/unused-package/package.json': { name: 'unused-package', version: '9.9.9', license: 'MIT', main: 'index.js', sideEffects: false },
    'node_modules/unused-package/index.js': "export const unused = 'unused'\n",
    'node_modules/unused-package/LICENSE': MIT('Unused Author'),
}

const trees = []

/** Writes `files`, path to content, under a fresh directory, and returns the directory. */
function tree (files) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'third-party-inventory-'))
    trees.push(dir)
    for (const [file, content] of Object.entries(files)) {
        fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
        fs.writeFileSync(path.join(dir, file), typeof content === 'string' ? content : JSON.stringify(content))
    }
    return dir
}

function build (dir) {
    const compiler = webpack({
        mode: 'production',
        context: dir,
        entry: './entry.js',
        output: { path: path.join(dir, 'dist'), filename: 'index.js' },
        optimization: { minimize: false },
        plugins: [new ThirdPartyInventoryPlugin({ root: ROOT, vendored: VENDORED_CSS })],
    })
    return new Promise((resolve, reject) => compiler.run((error, stats) => {
        compiler.close(() => (error ? reject(error) : resolve(stats)))
    }))
}

const read = (dir, file) => fs.readFileSync(path.join(dir, 'dist', file), 'utf8')

afterAll(() => {
    for (const dir of trees) fs.rmSync(dir, { recursive: true, force: true })
})

describe('scripts/third-party-inventory.js', () => {
    describe('a build', () => {
        let dir, stats

        beforeAll(async () => {
            dir = tree(FIXTURE)
            stats = await build(dir)
        })

        it('lists the packages in the emitted chunks: a nested copy as itself, and not one only built', () => {
            expect(stats.compilation.errors).toEqual([])
            const sbom = JSON.parse(read(dir, 'sbom.cdx.json'))

            expect(sbom.components.map(component => component.purl)).toEqual([
                'pkg:npm/%40scope/scoped-package@0.1.0',
                'pkg:npm/nested-package@2.0.0',
                'pkg:npm/used-package@1.2.3',
                'pkg:npm/float-label-css@1.0.2',
                'pkg:npm/normalize.css@7.0.0',
                'pkg:npm/semantic-ui-less@2.5.0',
            ])
            // webpack built `unused-package`, to learn it has no side effects. The bundle does not carry it.
            expect([...stats.compilation.modules].some(module => /unused-package/.test(module.resource || ''))).toBe(true)
        })

        it('writes the licence file of each bundled package verbatim, LICENSE.md included', () => {
            const licences = read(dir, 'THIRD-PARTY-LICENSES.txt')

            expect(licences).toContain(`used-package 1.2.3 (MIT)\n${'-'.repeat(72)}\n\n${MIT('Used Author').trimEnd()}`)
            expect(licences).toContain(MIT('Scoped Author').trimEnd())
            expect(licences).toContain(MIT('Nested Author').trimEnd())
            expect(licences).not.toContain('Hoisted Author')
            expect(licences).not.toContain('Unused Author')
        })

        it('describes the build in CycloneDX 1.5, with nothing that changes from one build to the next', () => {
            const sbom = JSON.parse(read(dir, 'sbom.cdx.json'))

            expect(sbom).toMatchObject({
                bomFormat: 'CycloneDX',
                specVersion: '1.5',
                version: 1,
                metadata: {
                    component: {
                        type: 'library',
                        name: 'host-library',
                        version: '1.0.0',
                        purl: 'pkg:npm/host-library@1.0.0',
                        licenses: [{ license: { id: 'Apache-2.0' } }],
                    },
                },
            })
            expect(sbom.components[0]).toMatchObject({
                group: '@scope',
                name: 'scoped-package',
                licenses: [{ expression: '(MIT OR Apache-2.0)' }],
                description: 'Bundled into dist/index.js',
            })
            expect(sbom.dependencies).toEqual([{
                ref: 'pkg:npm/host-library@1.0.0',
                dependsOn: sbom.components.map(component => component['bom-ref']),
            }])
            expect(Object.keys(sbom.metadata)).toEqual(['component'])
            expect(sbom).not.toHaveProperty('serialNumber')
        })
    })

    it('fails the build for a bundled package that ships no licence file, and writes neither file', async () => {
        const { 'node_modules/used-package/LICENSE': _licence, ...files } = FIXTURE
        const dir = tree(files)
        const stats = await build(dir)

        expect(stats.compilation.errors.map(error => error.message))
            .toEqual(['third-party inventory: used-package@1.2.3 ships no licence file'])
        expect(fs.existsSync(path.join(dir, 'dist', 'THIRD-PARTY-LICENSES.txt'))).toBe(false)
        expect(fs.existsSync(path.join(dir, 'dist', 'sbom.cdx.json'))).toBe(false)
    })

    it('reports a package that declares no licence, and sorts the same packages the same way in any order', () => {
        const dir = tree({
            ...FIXTURE,
            'node_modules/used-package/package.json': { name: 'used-package', version: '1.2.3', main: 'index.js' },
        })
        const files = [
            'node_modules/used-package/index.js',
            'node_modules/used-package/node_modules/nested-package/index.js',
            'node_modules/@scope/scoped-package/index.js',
        ].map(file => path.join(dir, file))

        const forwards = bundledPackages(files)
        const backwards = bundledPackages([...files].reverse())

        expect(forwards.problems).toEqual(['used-package@1.2.3 declares no licence'])
        expect(forwards.packages.map(pkg => pkg.name)).toEqual(['@scope/scoped-package', 'nested-package', 'used-package'])
        expect(backwards).toEqual(forwards)
    })

    it('finds the package a file belongs to by its last node_modules segment', () => {
        const at = (...segments) => path.join(path.sep, 'repo', ...segments)

        expect(packageRootOf(at('node_modules', 'final-form', 'dist', 'final-form.es.js'))).toBe(at('node_modules', 'final-form'))
        expect(packageRootOf(at('node_modules', '@rc-component', 'trigger', 'es', 'index.js'))).toBe(at('node_modules', '@rc-component', 'trigger'))
        expect(packageRootOf(at('node_modules', 'rc-util', 'node_modules', 'react-is', 'index.js')))
            .toBe(at('node_modules', 'rc-util', 'node_modules', 'react-is'))
        expect(packageRootOf(at('src', 'core', 'index.ts'))).toBeNull()
    })

    it('lists the vendored CSS exactly as THIRD-PARTY-NOTICES.md records it', () => {
        const notices = fs.readFileSync(path.join(__dirname, '..', '..', 'THIRD-PARTY-NOTICES.md'), 'utf8')
        const headings = notices.split('\n').filter(line => line.startsWith('## '))

        for (const { name, version, license } of VENDORED_CSS) {
            expect(headings.filter(heading => [name, version, license].every(part => heading.includes(part)))).toHaveLength(1)
        }
        expect(headings).toHaveLength(VENDORED_CSS.length)
        expect(sbomOf(ROOT, [], VENDORED_CSS).components.map(component => component.description))
            .toEqual(VENDORED_CSS.map(pkg => pkg.where))
        // Each says where the CSS lives, and that place exists.
        for (const { where } of VENDORED_CSS) {
            const place = where.match(/src\/style\/[\w./-]+/)[0]
            expect(fs.existsSync(path.join(__dirname, '..', '..', place))).toBe(true)
        }
    })
})
