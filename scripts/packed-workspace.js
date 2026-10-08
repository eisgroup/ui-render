const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

/**
 * The throwaway host the packed-tarball smokes run in: scripts/test-packed-consumer.js renders the published
 * bundle there on the server, and scripts/test-packed-browser.js in Chromium. The host lives outside the
 * repository and gets the tarball `npm pack` writes, as a real copy, with only the three externals (react,
 * react-dom, moment) linked in beside it. So a dependency that is neither bundled nor declared cannot be
 * satisfied by the repository's own node_modules, and fails loudly.
 */
const ROOT = path.resolve(__dirname, '..')
const EXTERNALS = ['react', 'react-dom', 'moment']

function run (command, args, options) {
    const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...options })
    if (result.status !== 0) {
        process.stderr.write(result.stdout || '')
        process.stderr.write(result.stderr || '')
        throw new Error(`${command} ${args.join(' ')} failed`)
    }
    return result.stdout
}

/** The override wins for what it carries; everything else keeps coming from this repository. */
function externalSource (reactDir, external) {
    const candidate = reactDir && path.join(reactDir, external)
    if (candidate && fs.existsSync(path.join(candidate, 'package.json'))) return candidate
    return path.join(ROOT, 'node_modules', external)
}

function packageVersion (packageDir) {
    return JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8')).version
}

/**
 * Packs the built dist/ (the caller builds it, with `npm run build-lib`) and installs the tarball into a new
 * host. `reactDir` takes the externals from another install, for the peer-range matrix. Returns the host's
 * directories and the versions it linked; the caller removes `workspace` when it is done.
 */
function createPackedConsumer ({ reactDir = null } = {}) {
    const workspace = fs.mkdtempSync(path.join(os.tmpdir(), 'eis-ui-render-packed-'))
    try {
        // --ignore-scripts keeps prepack from rebuilding dist/ here.
        const stdout = run('npm', [
            'pack', '--json', '--ignore-scripts', '--pack-destination', workspace,
        ], { cwd: ROOT })
        // npm prints the JSON array last; anything before it is notice noise.
        const start = stdout.indexOf('[')
        if (start === -1) throw new Error('npm pack produced no JSON payload')
        const tarball = path.join(workspace, JSON.parse(stdout.slice(start))[0].filename)

        const extracted = path.join(workspace, 'extracted')
        fs.mkdirSync(extracted)
        run('tar', ['-xzf', tarball, '-C', extracted])

        const consumer = path.join(workspace, 'consumer')
        const modules = path.join(consumer, 'node_modules')
        fs.mkdirSync(modules, { recursive: true })
        // A real copy, not a symlink: Node resolves symlinked packages by realpath, which would let the bundle
        // reach the repository's node_modules and hide a missing dependency.
        fs.cpSync(path.join(extracted, 'package'), path.join(modules, 'eis-ui-render'), { recursive: true })
        const linked = {}
        for (const external of EXTERNALS) {
            const source = externalSource(reactDir, external)
            // Node resolves a symlinked package by realpath, so each external keeps loading its own transitive
            // dependencies (react-dom 16 finds react 16 next to it, not this repository's react 18).
            fs.symlinkSync(source, path.join(modules, external))
            linked[external] = packageVersion(source)
            console.log(`packed external: ${external} ${linked[external]} from ${source}`)
        }
        // An override that carries react but not react-dom would silently pair mismatched renderers, which fails
        // later with a React error that says nothing about the harness.
        if (linked.react.split('.')[0] !== linked['react-dom'].split('.')[0]) {
            throw new Error(`react ${linked.react} and react-dom ${linked['react-dom']} must share a major version`)
        }
        return { workspace, consumer, packageDir: path.join(modules, 'eis-ui-render'), linked }
    } catch (error) {
        fs.rmSync(workspace, { recursive: true, force: true })
        throw error
    }
}

module.exports = { ROOT, run, createPackedConsumer }
