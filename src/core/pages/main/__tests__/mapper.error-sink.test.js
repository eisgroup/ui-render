/**
 * THE PRODUCTION ERROR SINK ===================================================
 *
 * UPGRADE-PLAN §9.4 / §2.6-3. `mapper.js` installs the `Render.onError` sink the
 * shipped library actually runs with. It used to destructure `{err, errInfo}`
 * from a report the boundary emits as `{error, errorInfo}` and `console.log` the
 * three values, so the one channel a consumer could observe printed
 * `undefined undefined {…props}` — a render failure was, in practice, silent.
 *
 * This suite is deliberately about the SINK, not about the boundary (see
 * src/core/ui-render/__tests__/Render.error-reporting.test.js for that): it
 * imports the mapper for its module-level side effect and calls the installed
 * function with the report shape the boundary emits.
 * -----------------------------------------------------------------------------
 */
// `rules` is imported (not `mapper` directly) because the engine's module graph is
// circular — importing the mapper first leaves `modules/form` half-initialised. Importing
// the engine entry point installs the same sink, through `rules.js`'s own `import './mapper'`.
import '../rules'
import Render from '../../../ui-render/Render'

describe('mapper Render.onError sink', () => {
    let consoleError

    beforeEach(() => {
        consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        consoleError.mockRestore()
    })

    const report = {
        error: new TypeError('items.map is not a function'),
        errorInfo: { componentStack: '\n    at Table' },
        path: 'items[3].items[0]',
        props: { view: 'Table', name: 'orders' },
        message: '[ui-render] render error at "items[3].items[0]" (view "Table", name "orders"):'
            + ' TypeError: items.map is not a function',
    }

    it('reports the error, the meta path and the failing node on the error channel', () => {
        Render.onError(report)

        expect(consoleError).toHaveBeenCalledTimes(1)
        const [line] = consoleError.mock.calls[0]
        expect(line).toContain('items.map is not a function')
        expect(line).toContain('items[3].items[0]')
        expect(line).toContain('Table')
    })

    it('passes the whole report on, so a host can inspect the component stack and props', () => {
        Render.onError(report)

        expect(consoleError.mock.calls[0]).toContain(report)
    })

    it('reports a bare report that carries no path or props', () => {
        Render.onError({ error: new Error('boom') })

        expect(consoleError).toHaveBeenCalledTimes(1)
        expect(consoleError.mock.calls[0][0]).toContain('boom')
    })
})
