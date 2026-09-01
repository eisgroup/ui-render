/**
 * MANIFEST CONTRACT ===========================================================
 *
 * The single enforcement point for UPGRADE-PLAN §0.8's tracked-files rule.
 *
 * `src/demo/examples/` doubles as a scratch directory: contributors drop real
 * customer meta/data JSON in it while debugging and leave those files untracked
 * on purpose. Any code that discovers examples by scanning the directory would
 * pick them up — into the demo bundle, into a snapshot file, into a commit.
 * `manifest.js` is therefore the only place a file may be admitted, and this
 * test proves the manifest is closed over the tracked set:
 *
 *   1. every file `manifest.js` imports is git-tracked;
 *   2. every tracked file in the directory is either imported by the manifest or
 *      classified in `UNREGISTERED_EXAMPLE_FILES` with a reason (so the mapping
 *      is total — a newly added file cannot slip in unclassified);
 *   3. no untracked file sitting in the directory is referenced by the manifest.
 *
 * Check 1 is what makes 2 safe: `UNREGISTERED_EXAMPLE_FILES` keys must also be
 * tracked, so an untracked customer JSON cannot be laundered through it either.
 * -----------------------------------------------------------------------------
 */
import { execFileSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import {
    EXAMPLES,
    MANIFEST_INFRASTRUCTURE_FILES,
    UNREGISTERED_EXAMPLE_FILES,
    hasFlag,
    snapshotExamples,
} from '../manifest'

const EXAMPLES_DIR = path.resolve(__dirname, '..')
const MANIFEST_PATH = path.join(EXAMPLES_DIR, 'manifest.js')
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..')
const DIR_IN_REPO = 'src/demo/examples'

/**
 * Top-level tracked filenames in `src/demo/examples/`, straight from git.
 * Subdirectory entries (`__tests__/`, `__snapshots__/`) are test infrastructure,
 * not example payloads, so they are filtered out.
 *
 * Deliberately NOT wrapped in a try/catch that skips: an enforcement point that
 * silently disappears when git is unavailable enforces nothing.
 */
const trackedExampleFiles = () => execFileSync(
    'git', ['ls-files', '-z', '--', DIR_IN_REPO],
    { cwd: REPO_ROOT, encoding: 'utf8' },
)
    .split('\0')
    .filter(Boolean)
    .map(file => path.posix.relative(DIR_IN_REPO, file))
    .filter(file => !file.includes('/'))

/** Import specifiers the manifest resolves against this directory. */
const manifestImports = () => {
    const source = fs.readFileSync(MANIFEST_PATH, 'utf8')
    return [...source.matchAll(/from '\.\/([^']+)'/g)].map(([, file]) => file)
}

describe('canonical example manifest', () => {
    const tracked = trackedExampleFiles()
    const imported = manifestImports()

    it('reads a non-trivial tracked file set from git', () => {
        // Guards against the checks below passing vacuously on an empty git result.
        expect(tracked.length).toBeGreaterThan(40)
        expect(tracked).toContain('_meta.js')
        expect(imported.length).toBeGreaterThan(40)
    })

    it('imports only git-tracked files', () => {
        expect(imported.filter(file => !tracked.includes(file))).toEqual([])
    })

    it('imports every file with an explicit extension, so no import is ambiguous', () => {
        expect(imported.filter(file => !/\.(js|jsx|json)$/.test(file))).toEqual([])
    })

    it('never references an untracked file present in the directory', () => {
        // On a clean CI checkout there are no untracked files and this is vacuous;
        // on a contributor machine holding customer JSON it is the live guard.
        const untrackedInDir = fs.readdirSync(EXAMPLES_DIR, { withFileTypes: true })
            .filter(entry => entry.isFile())
            .map(entry => entry.name)
            .filter(name => !tracked.includes(name))

        expect(untrackedInDir.filter(file => imported.includes(file))).toEqual([])
        expect(untrackedInDir.filter(file => file in UNREGISTERED_EXAMPLE_FILES)).toEqual([])
    })

    it('classifies every tracked file as either registered or explicitly unregistered', () => {
        const classified = new Set([
            ...imported,
            ...Object.keys(UNREGISTERED_EXAMPLE_FILES),
            ...MANIFEST_INFRASTRUCTURE_FILES,
        ])
        // A new tracked example file fails here until it is imported by the
        // manifest or listed in UNREGISTERED_EXAMPLE_FILES with a reason.
        expect(tracked.filter(file => !classified.has(file))).toEqual([])
    })

    it('keeps the unregistered list free of stale and unexplained entries', () => {
        const unregistered = Object.entries(UNREGISTERED_EXAMPLE_FILES)
        expect(unregistered.filter(([file]) => !tracked.includes(file))).toEqual([])
        expect(unregistered.filter(([file]) => imported.includes(file))).toEqual([])
        expect(unregistered.filter(([, reason]) => !reason || !reason.trim())).toEqual([])
    })

    it('exposes well-formed, uniquely identified examples', () => {
        expect(EXAMPLES).toHaveLength(38)
        expect(new Set(EXAMPLES.map(({ id }) => id)).size).toBe(EXAMPLES.length)
        expect(new Set(EXAMPLES.map(({ title }) => title)).size).toBe(EXAMPLES.length)
        EXAMPLES.forEach(example => {
            expect(typeof example.id).toBe('string')
            expect(example.id).not.toHaveLength(0)
            expect(typeof example.title).toBe('string')
            expect(example.title).not.toHaveLength(0)
            expect(example.meta).toBeTruthy()
            expect(example.data).toBeTruthy()
        })
    })

    it('pins the flagged subsets so a flag cannot be lost or invented silently', () => {
        expect(EXAMPLES.filter(example => hasFlag(example, 'hostApi')).map(({ id }) => id)).toEqual([
            'selectIndexValue',
            'selectStableValue',
            'selectCascading',
            'selectCascadingStable',
            'selectReorder',
            'buttonIcon',
            'tableForm',
            'nestedDataKind',
            'ratingDetails',
        ])
        // Every declared flag must be one the consumers actually honour.
        const knownFlags = ['hostApi', 'noSnapshot']
        EXAMPLES.forEach(({ id, flags }) => {
            Object.keys(flags || {}).forEach(flag => {
                expect({ id, flag, knownFlags }).toEqual({ id, flag, knownFlags: expect.arrayContaining([`${flag}`]) })
            })
        })
        // Nothing opts out of the DOM contract snapshots today.
        expect(snapshotExamples()).toHaveLength(EXAMPLES.length)
    })
})
