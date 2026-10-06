/**
 * Fails a test that prints to `console.error` or `console.warn`.
 *
 * Wired in `jest.config.js` as a `setupFilesAfterEnv` entry, so every leg that extends that config runs
 * it too: React 16.14, 17 and 19 (`scripts/fixtures/react-legacy/jest-config.js`) and the built-CSS run.
 *
 * WHY. React reports what is wrong with a render through `console.error` (a list without keys, an update
 * outside `act`, a value React will not put in the DOM), and the library reports a dropped prop through
 * `console.warn`. Printed by a passing test, such a line is read by nobody. Measured on 2026-10-06, before
 * this existed: 12 test files printed 20 lines on React 18 and 19, and 16 files on 16.14 and 17. Three of
 * the causes were in the product (`PopupContent` and `TableView` rendering lists without keys, and `Text`
 * handing its translator to a DOM element); the rest were tests that did not wait inside `act` or did not
 * say they expected a warning.
 *
 * A test that expects a line replaces that method and asserts what it expects:
 *
 *     const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
 *     …
 *     expect(warn).toHaveBeenCalledWith(expect.stringContaining('ignores the `multiple` prop'))
 *     warn.mockRestore()
 *
 * The guard sees nothing a mock swallowed. A spy WITHOUT a mock implementation still prints, and fails.
 * `console.log` and `console.info` are not guarded: they are for debugging, and nothing reports through
 * them. Lines printed outside a test (while a file loads, in `beforeAll`, in `afterAll`) are not counted.
 */
const util = require('util')

const GUARDED = ['error', 'warn']

let printed = []

for (const level of GUARDED) {
    const print = console[level]
    console[level] = function guarded (...args) {
        printed.push(`console.${level}: ${util.format(...args)}`)
        return print.apply(this, args)
    }
}

beforeEach(() => {
    printed = []
})

afterEach(() => {
    if (!printed.length) return
    const lines = printed
    printed = []
    throw new Error(
        `This test printed ${lines.length} line(s) to the console. Fix what they report, or, if the test`
        + ' expects them, replace that console method with a mock and assert them'
        + ' (scripts/jest-console-guard.js):\n\n'
        + lines.map(line => line.split('\n').slice(0, 12).join('\n')).join('\n\n')
    )
})
