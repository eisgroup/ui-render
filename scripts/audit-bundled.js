/**
 * THE PACKAGES THE BUNDLE CARRIES, AUDITED: `npm run audit:bundled`, after `npm run build-lib`, and every week in CI
 * (.github/workflows/audit-bundled.yml).
 *
 * A host installs no dependency of ours (`dependencies` is empty), so `npm audit --omit=dev` audits nothing, and a
 * full `npm audit` reports the whole development tree: 36 findings on 2026-10-09, none of them in code a host
 * receives. What a host receives is what webpack bundled into `dist/`, which `dist/sbom.cdx.json` lists
 * (scripts/third-party-inventory.js). This runs `npm audit` and keeps the findings on those packages, at the
 * version the bundle carries: npm names the installed copies an advisory covers (`nodes`), and a copy is the
 * bundled one when its version is the one the SBOM names.
 *
 * Exits 1 when a bundled package has a finding at `--level` or above (moderate by default), 2 when it cannot tell.
 */
const { execFileSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const LEVELS = ['info', 'low', 'moderate', 'high', 'critical']

/** `{name, version}` for each package a CycloneDX SBOM lists, a scope joined to its name as npm writes it. */
function bundledPackages (sbom) {
    return (sbom.components || []).map(({ group, name, version }) => ({ name: group ? `${group}/${name}` : name, version }))
}

/**
 * The findings of an `npm audit --json` report on the bundled packages.
 *
 * @param {Array<{name: string, version: string}>} bundled - what the bundle carries
 * @param {Object} audit - the parsed report
 * @param {function(string): (string|undefined)} versionAt - the version installed at a `nodes` path
 * @returns {Array<{name, version, severity, advisories: Array<{title, url, severity, range}>, through: string[]}>}
 */
function bundledFindings (bundled, audit, versionAt) {
    const vulnerabilities = audit.vulnerabilities || {}
    const findings = []
    for (const { name, version } of bundled) {
        const entry = vulnerabilities[name]
        if (!entry || !entry.nodes.some(node => versionAt(node) === version)) continue
        findings.push({
            name,
            version,
            severity: entry.severity,
            advisories: entry.via.filter(via => typeof via === 'object')
                .map(({ title, url, severity, range }) => ({ title, url, severity, range })),
            // A package that is vulnerable only through another names it: that one is in the list too, if bundled.
            through: entry.via.filter(via => typeof via === 'string'),
        })
    }
    return findings
}

/** Whether a finding's severity is at `level` or above. */
const atLeast = (severity, level) => LEVELS.indexOf(severity) >= LEVELS.indexOf(level)

function main (argv) {
    const level = (argv.find(arg => arg.startsWith('--level=')) || '--level=moderate').slice('--level='.length)
    if (LEVELS.indexOf(level) === -1) {
        console.error(`--level must be one of ${LEVELS.join(', ')}`)
        return 2
    }
    const sbomPath = path.join(ROOT, 'dist', 'sbom.cdx.json')
    if (!fs.existsSync(sbomPath)) {
        console.error('dist/sbom.cdx.json is missing: run `npm run build-lib` first.')
        return 2
    }
    let report
    try {
        report = execFileSync('npm', ['audit', '--json'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    } catch (error) {
        // `npm audit` exits 1 when the tree has any finding; the report is on stdout all the same.
        report = error.stdout
    }
    let audit
    try {
        audit = JSON.parse(report)
    } catch (error) {
        console.error(`npm audit printed no report: ${error.message}`)
        return 2
    }
    if (audit.error) {
        console.error(`npm audit failed: ${JSON.stringify(audit.error)}`)
        return 2
    }
    const bundled = bundledPackages(JSON.parse(fs.readFileSync(sbomPath, 'utf8')))
    const versionAt = node => {
        try {
            return JSON.parse(fs.readFileSync(path.join(ROOT, node, 'package.json'), 'utf8')).version
        } catch (error) {
            return undefined
        }
    }
    const findings = bundledFindings(bundled, audit, versionAt)
    const total = (audit.metadata && audit.metadata.vulnerabilities && audit.metadata.vulnerabilities.total) || 0
    console.log(`npm audit: ${total} finding(s) in the installed tree; ${bundled.length} package(s) bundled, `
        + `${findings.length} of them with a finding.`)
    for (const finding of findings) {
        console.log(`\n${finding.name}@${finding.version}: ${finding.severity}`)
        for (const advisory of finding.advisories) console.log(`  ${advisory.severity}: ${advisory.title} (${advisory.range}) ${advisory.url}`)
        if (finding.through.length) console.log(`  through ${finding.through.join(', ')}`)
    }
    const failing = findings.filter(finding => atLeast(finding.severity, level))
    if (failing.length) {
        console.error(`\n${failing.length} bundled package(s) with a finding at ${level} or above.`)
        return 1
    }
    return 0
}

if (require.main === module) process.exit(main(process.argv.slice(2)))

module.exports = { bundledPackages, bundledFindings, atLeast }
