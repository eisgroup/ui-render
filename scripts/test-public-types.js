const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

const ROOT = path.resolve(__dirname, '..')
const DIST = path.join(ROOT, 'dist')
const FIXTURES = path.join(__dirname, 'fixtures')
const CACHE = path.join(ROOT, 'node_modules', '.cache', 'public-types-consumer')
const TSC = require.resolve('typescript/bin/tsc')

const REACT_TYPES = [
    ['16', 'react-types-16'],
    ['17', '@types/react'],
    ['18', 'react-types-18'],
]
const TYPE_CONFIGS = [
    ['interop default import', 'tsconfig.public-types.json'],
    ['direct CommonJS import', 'tsconfig.public-types-commonjs.json'],
]

function packageRoot (name) {
    return path.dirname(require.resolve(`${name}/package.json`))
}

function assertReactTypesMajor (expectedMajor, packageName) {
    const manifest = require(path.join(packageRoot(packageName), 'package.json'))
    const actualMajor = manifest.version.split('.')[0]
    if (actualMajor !== expectedMajor) {
        throw new Error(`${packageName} contains @types/react ${manifest.version}; expected major ${expectedMajor}`)
    }
}

function copyDeclarations (target) {
    const declarations = fs.readdirSync(DIST).filter(file => file.endsWith('.d.ts'))
    if (!declarations.includes('index.d.ts')) {
        throw new Error('dist/index.d.ts is missing; run npm run gen-ts first')
    }
    for (const declaration of declarations) {
        fs.copyFileSync(path.join(DIST, declaration), path.join(target, declaration))
    }
}

function assertRuntimeExport () {
    const runtime = require(path.join(DIST, 'index.js'))
    if (typeof runtime !== 'function') {
        throw new Error(`dist/index.js must export a function directly; received ${typeof runtime}`)
    }
    if (runtime.default !== undefined || runtime.UIRender !== undefined) {
        throw new Error('dist/index.js unexpectedly exposes .default or .UIRender')
    }
    console.log('public runtime: direct callable CommonJS export passed')
}

function prepareConsumer (major, reactTypesPackage) {
    const consumer = path.join(CACHE, `react-${major}`)
    const packageDir = path.join(consumer, 'node_modules', 'eis-ui-render')
    const reactTypesDir = path.join(consumer, 'node_modules', '@types', 'react')

    fs.mkdirSync(packageDir, { recursive: true })
    fs.mkdirSync(path.dirname(reactTypesDir), { recursive: true })
    copyDeclarations(packageDir)
    fs.cpSync(packageRoot(reactTypesPackage), reactTypesDir, { recursive: true })
    for (const fixture of [
        'public-types-consumer.tsx',
        'public-types-commonjs-consumer.tsx',
        ...TYPE_CONFIGS.map(([, config]) => config),
    ]) {
        fs.copyFileSync(path.join(FIXTURES, fixture), path.join(consumer, fixture))
    }
    fs.writeFileSync(path.join(packageDir, 'package.json'), JSON.stringify({
        name: 'eis-ui-render',
        private: true,
        types: 'index.d.ts',
    }, null, 2))

    return consumer
}

fs.rmSync(CACHE, { recursive: true, force: true })

try {
    assertRuntimeExport()
    for (const [major, reactTypesPackage] of REACT_TYPES) {
        assertReactTypesMajor(major, reactTypesPackage)
        const consumer = prepareConsumer(major, reactTypesPackage)
        for (const [label, config] of TYPE_CONFIGS) {
            const result = spawnSync(process.execPath, [TSC, '--project', config], {
                cwd: consumer,
                encoding: 'utf8',
            })
            if (result.status !== 0) {
                process.stderr.write(result.stdout)
                process.stderr.write(result.stderr)
                throw new Error(`public declarations failed with @types/react ${major} (${label})`)
            }
            console.log(`public declarations: @types/react ${major} (${label}) passed`)
        }
    }
} finally {
    fs.rmSync(CACHE, { recursive: true, force: true })
}
