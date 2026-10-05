/**
 * THE THIRD-PARTY CODE THE PUBLISHED PACKAGE CARRIES, RECORDED NEXT TO THE BUNDLE AT BUILD TIME.
 * =============================================================================================
 *
 * `dist/index.js` bundles every package it uses at runtime. Only the peers are external (`react`,
 * `react-dom`, `moment`), and `dependencies` is empty. So the manifest declares none of the third-party
 * code that ships, and `npm sbom --omit dev` reports no components at all. Measured on 2026-10-05, the
 * bundle carried 16 packages, all MIT. Minification kept the licence banners of two of them, in
 * `dist/index.js.LICENSE.txt`, and the other fourteen shipped without their notices.
 *
 * The plugin below reads the packages from what webpack emits, the modules of the output chunks, not
 * from the module graph. The graph holds more: `css-loader`'s runtime is built there, because
 * mini-css-extract-plugin runs the stylesheets at build time, but none of it reaches the bundle.
 * It writes two files into `dist/`:
 *
 *   THIRD-PARTY-LICENSES.txt  the licence file of each bundled package, verbatim
 *   sbom.cdx.json             a CycloneDX 1.5 SBOM of the bundled packages, and of the CSS that
 *                             `THIRD-PARTY-NOTICES.md` records as vendored
 *
 * A bundled package with no licence file, or no `license` field, fails the build: its notice is what
 * the first file is for. Both files are deterministic. They carry no timestamp and no serial number,
 * and the packages are sorted by name and version, so the same tree builds the same bytes.
 */
const fs = require('fs')
const path = require('path')

/**
 * The CSS vendored under `src/style/vendor/` and shipped in `static/all.css`. It comes from no
 * `node_modules` package, so the bundle cannot name it: `THIRD-PARTY-NOTICES.md` holds its licences, and
 * a contract test holds this list to that file.
 */
const VENDORED_CSS = [
    { name: 'normalize.css', version: '7.0.0', license: 'MIT' },
    { name: 'semantic-ui-less', version: '2.5.0', license: 'MIT' },
]

const NODE_MODULES = `${path.sep}node_modules${path.sep}`

/**
 * The root of the package a file belongs to, or null for a file of this repository. The LAST
 * `node_modules` segment decides, so a nested copy, such as `rc-util/node_modules/react-is`, is a
 * package of its own.
 */
function packageRootOf (file) {
    const at = file.lastIndexOf(NODE_MODULES)
    if (at < 0) return null
    const start = at + NODE_MODULES.length
    const segments = file.slice(start).split(path.sep)
    return file.slice(0, start) + segments.slice(0, segments[0].startsWith('@') ? 2 : 1).join(path.sep)
}

/** Every source file in the emitted chunks, the modules inside concatenated ones included. */
function emittedFiles (compilation) {
    const files = new Set()
    const visit = module => {
        if (module.modules) for (const inner of module.modules) visit(inner)
        if (typeof module.resource === 'string') files.add(module.resource.split('?')[0])
    }
    for (const chunk of compilation.chunks) {
        for (const module of compilation.chunkGraph.getChunkModulesIterable(chunk)) visit(module)
    }
    return files
}

/** Name, version, declared licence and licence text of the package at `root`. */
function readPackage (root) {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
    const licenceFile = fs.readdirSync(root).sort().find(name => /^licen[cs]e(\.|$)/i.test(name))
    return {
        name: manifest.name,
        version: manifest.version,
        license: manifest.license,
        text: licenceFile ? fs.readFileSync(path.join(root, licenceFile), 'utf8') : null,
    }
}

// By code unit, not `localeCompare`: the order must not depend on the ICU data Node was built with.
const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)
const byNameAndVersion = (a, b) => compare(a.name, b.name) || compare(a.version, b.version)

/**
 * The packages the given files belong to, sorted by name and version, and the reasons any of them
 * cannot ship.
 */
function bundledPackages (files) {
    const roots = new Set()
    for (const file of files) {
        const root = packageRootOf(file)
        if (root) roots.add(root)
    }
    const unique = new Map()
    for (const pkg of [...roots].map(readPackage)) unique.set(`${pkg.name}@${pkg.version}`, pkg)
    const packages = [...unique.values()].sort(byNameAndVersion)
    const problems = []
    for (const pkg of packages) {
        if (typeof pkg.license !== 'string' || !pkg.license) problems.push(`${pkg.name}@${pkg.version} declares no licence`)
        if (!pkg.text) problems.push(`${pkg.name}@${pkg.version} ships no licence file`)
    }
    return { packages, problems }
}

/** The package URL of an npm package. A scope is its namespace, with the `@` percent-encoded. */
const purlOf = ({ name, version }) => `pkg:npm/${name.replace(/^@/, '%40')}@${version}`

/** A declared licence as CycloneDX takes it: an SPDX identifier, an SPDX expression, or a name. */
const licenceOf = license => /^[A-Za-z0-9.+-]+$/.test(license) ? { license: { id: license } }
    : /\b(OR|AND|WITH)\b/.test(license) ? { expression: license }
    : { license: { name: license } }

/** A package as a CycloneDX component. A scope becomes the component's `group`. */
function componentOf (pkg, description) {
    const [group, name] = pkg.name.startsWith('@') ? pkg.name.split('/') : [null, pkg.name]
    const purl = purlOf(pkg)
    return {
        type: 'library',
        'bom-ref': purl,
        ...(group ? { group } : {}),
        name,
        version: pkg.version,
        ...(description ? { description } : {}),
        licenses: [licenceOf(pkg.license)],
        purl,
    }
}

/** The CycloneDX 1.5 document: `root` is the package being built, `packages` what its bundle carries. */
function sbomOf (root, packages, vendored = []) {
    const components = [
        ...packages.map(pkg => componentOf(pkg, 'Bundled into dist/index.js')),
        ...[...vendored].sort(byNameAndVersion)
            .map(pkg => componentOf(pkg, 'CSS vendored under src/style/vendor/, shipped in static/all.css')),
    ]
    const rootComponent = componentOf(root)
    return {
        $schema: 'http://cyclonedx.org/schema/bom-1.5.schema.json',
        bomFormat: 'CycloneDX',
        specVersion: '1.5',
        version: 1,
        metadata: { component: rootComponent },
        components,
        dependencies: [{ ref: rootComponent['bom-ref'], dependsOn: components.map(component => component['bom-ref']) }],
    }
}

/** The licence file of each bundled package, verbatim, under a heading naming it. */
function licencesTextOf (packages) {
    const rule = '-'.repeat(72)
    return [
        'Third-party software bundled into dist/index.js',
        '',
        'Generated when the library is built (scripts/third-party-inventory.js), from the modules webpack',
        'emits into the bundle. The CSS this package vendors is recorded in THIRD-PARTY-NOTICES.md, and',
        'every third-party component is listed in dist/sbom.cdx.json.',
        ...packages.flatMap(pkg => ['', rule, `${pkg.name} ${pkg.version} (${pkg.license})`, rule, '', pkg.text.trimEnd()]),
        '',
    ].join('\n')
}

/** Writes `THIRD-PARTY-LICENSES.txt` and `sbom.cdx.json` into the output directory, from the emitted chunks. */
class ThirdPartyInventoryPlugin {
    /**
     * @param {Object} options
     * @param {{name: string, version: string, license: string}} options.root - the package being built
     * @param {Array<{name: string, version: string, license: string}>} [options.vendored] - third-party
     *   code that ships without coming from `node_modules`
     */
    constructor ({ root, vendored = [] }) {
        this.root = root
        this.vendored = vendored
    }

    apply (compiler) {
        const { Compilation, WebpackError, sources } = compiler.webpack
        compiler.hooks.thisCompilation.tap('ThirdPartyInventory', compilation => {
            compilation.hooks.processAssets.tap(
                { name: 'ThirdPartyInventory', stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
                () => {
                    const { packages, problems } = bundledPackages(emittedFiles(compilation))
                    for (const problem of problems) compilation.errors.push(new WebpackError(`third-party inventory: ${problem}`))
                    if (problems.length) return
                    compilation.emitAsset('THIRD-PARTY-LICENSES.txt', new sources.RawSource(licencesTextOf(packages)))
                    const sbom = sbomOf(this.root, packages, this.vendored)
                    compilation.emitAsset('sbom.cdx.json', new sources.RawSource(`${JSON.stringify(sbom, null, 2)}\n`))
                },
            )
        })
    }
}

module.exports = {
    ThirdPartyInventoryPlugin,
    VENDORED_CSS,
    bundledPackages,
    componentOf,
    licencesTextOf,
    packageRootOf,
    purlOf,
    sbomOf,
}
