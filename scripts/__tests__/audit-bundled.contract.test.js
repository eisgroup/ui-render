/**
 * `npm run audit:bundled` (scripts/audit-bundled.js) keeps the `npm audit` findings on what the bundle carries.
 * Its network half, `npm audit` itself, runs in CI once a week; this pins the half that decides what counts.
 */
const { atLeast, bundledFindings, bundledPackages } = require('../audit-bundled')

const sbom = {
    components: [
        { group: '@rc-component', name: 'trigger', version: '2.3.1' },
        { name: 'rc-picker', version: '4.11.3' },
        { name: 'final-form', version: '4.20.10' },
    ],
}

const advisory = (title, severity) => ({ title, severity, url: `https://example.test/${title}`, range: '<9' })

const audit = {
    vulnerabilities: {
        // Bundled, at the bundled version: a finding.
        'rc-picker': { severity: 'high', nodes: ['node_modules/rc-picker'], via: [advisory('picker', 'high'), 'dayjs'] },
        // Bundled, but the vulnerable copy is another version, a development package's own: not ours.
        'final-form': { severity: 'moderate', nodes: ['node_modules/some-tool/node_modules/final-form'], via: [advisory('form', 'moderate')] },
        // Not bundled at all: the development tree.
        eslint: { severity: 'high', nodes: ['node_modules/eslint'], via: [advisory('lint', 'high')] },
    },
}

const installed = {
    'node_modules/rc-picker': '4.11.3',
    'node_modules/some-tool/node_modules/final-form': '4.19.0',
    'node_modules/eslint': '9.39.5',
}

describe('audit:bundled', () => {
    it('reads the bundled packages out of the SBOM, a scope joined to its name', () => {
        expect(bundledPackages(sbom)).toEqual([
            { name: '@rc-component/trigger', version: '2.3.1' },
            { name: 'rc-picker', version: '4.11.3' },
            { name: 'final-form', version: '4.20.10' },
        ])
    })

    it('keeps a finding only on a bundled package at the version the bundle carries', () => {
        const findings = bundledFindings(bundledPackages(sbom), audit, node => installed[node])
        expect(findings).toEqual([{
            name: 'rc-picker',
            version: '4.11.3',
            severity: 'high',
            advisories: [{ title: 'picker', severity: 'high', url: 'https://example.test/picker', range: '<9' }],
            through: ['dayjs'],
        }])
    })

    it('finds nothing in a report with no vulnerabilities', () => {
        expect(bundledFindings(bundledPackages(sbom), { vulnerabilities: {} }, () => undefined)).toEqual([])
        expect(bundledFindings(bundledPackages({}), audit, node => installed[node])).toEqual([])
    })

    it('compares severities in npm audit order', () => {
        expect(atLeast('high', 'moderate')).toBe(true)
        expect(atLeast('moderate', 'moderate')).toBe(true)
        expect(atLeast('low', 'moderate')).toBe(false)
        expect(atLeast('critical', 'high')).toBe(true)
    })
})
