import React from 'react'
import { act, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Form } from 'react-final-form'
import { ConfigContext, initialConfigState } from '../../../../contexts/ConfigContext'
import AutoSave from '../AutoSave'

const deferred = () => {
    let resolve
    const promise = new Promise(done => {
        resolve = done
    })
    return { promise, resolve }
}

const AutoSaveForm = ({ autoSaveProps, captureForm }) => (
    <ConfigContext.Provider value={initialConfigState}>
        <Form
            onSubmit={() => {}}
            initialValues={{ amount: 1 }}
            render={({ form }) => {
                captureForm(form)
                return <AutoSave {...autoSaveProps} />
            }}
        />
    </ConfigContext.Provider>
)

const advance = async (milliseconds) => {
    await act(async () => {
        jest.advanceTimersByTime(milliseconds)
        await Promise.resolve()
    })
}

describe('AutoSave asynchronous contracts', () => {
    beforeEach(() => jest.useFakeTimers())
    afterEach(() => jest.useRealTimers())

    it('shows the default loading state until an asynchronous save settles', async () => {
        const pending = deferred()
        const onChange = jest.fn(() => pending.promise)
        let form

        render(
            <AutoSaveForm
                autoSaveProps={{ onChange, delay: 50, showLoader: true }}
                captureForm={value => { form = value }}
            />
        )
        await advance(50)

        act(() => form.change('amount', 2))
        await advance(50)

        expect(onChange).toHaveBeenCalledWith({ amount: 2 })
        expect(screen.getByText('Syncing...')).toBeInTheDocument()

        await act(async () => {
            pending.resolve()
            await pending.promise
        })

        expect(screen.queryByText('Syncing...')).not.toBeInTheDocument()
    })

    it('serializes overlapping saves and sends the latest value after the first resolves', async () => {
        const firstSave = deferred()
        const onChange = jest.fn()
            .mockImplementationOnce(() => firstSave.promise)
            .mockResolvedValueOnce(undefined)
        let form

        render(
            <AutoSaveForm
                autoSaveProps={{ onChange, delay: 25, loadContent: 'Saving now', showLoader: true }}
                captureForm={value => { form = value }}
            />
        )
        await advance(25)

        act(() => form.change('amount', 2))
        await advance(25)
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(screen.getByText('Saving now')).toBeInTheDocument()

        act(() => form.change('amount', 3))
        await advance(25)
        expect(onChange).toHaveBeenCalledTimes(1)

        await act(async () => {
            firstSave.resolve()
            await firstSave.promise
            await Promise.resolve()
        })

        expect(onChange).toHaveBeenCalledTimes(2)
        expect(onChange.mock.calls[1][0]).toEqual({ amount: 3 })
        expect(screen.queryByText('Saving now')).not.toBeInTheDocument()
    })

    it('saves through the onChange and partial of the latest render', async () => {
        // The class read `this.props` when a save ran. The function component reads the latest
        // render's props the same way (§9.3 step 6), rather than the ones its debounce was built with.
        const first = jest.fn().mockResolvedValue(undefined)
        const second = jest.fn().mockResolvedValue(undefined)
        let form
        const captureForm = value => { form = value }
        const { rerender } = render(
            <AutoSaveForm autoSaveProps={{ onChange: first, delay: 20 }} captureForm={captureForm}/>
        )
        await advance(20)

        rerender(
            <AutoSaveForm autoSaveProps={{ onChange: second, partial: true, delay: 20 }} captureForm={captureForm}/>
        )
        act(() => form.change('note', 'x'))
        await advance(20)

        expect(first).not.toHaveBeenCalled()
        expect(second).toHaveBeenCalledTimes(1)
        expect(second).toHaveBeenCalledWith({ note: 'x' })
    })

    it('diffs a partial save against the values it last saved', async () => {
        const onChange = jest.fn().mockResolvedValue(undefined)
        let form
        render(
            <AutoSaveForm
                autoSaveProps={{ onChange, partial: true, delay: 20 }}
                captureForm={value => { form = value }}
            />
        )
        await advance(20)

        act(() => form.change('amount', 2))
        await advance(20)
        act(() => form.change('note', 'x'))
        await advance(20)

        expect(onChange.mock.calls.map(([saved]) => saved)).toEqual([{ amount: 2 }, { note: 'x' }])
    })

    it('rebuilds the debounce handler when the delay prop changes', async () => {
        const onChange = jest.fn().mockResolvedValue(undefined)
        let form
        const captureForm = value => { form = value }
        const { rerender } = render(
            <AutoSaveForm
                autoSaveProps={{ onChange, delay: 100 }}
                captureForm={captureForm}
            />
        )
        await advance(100)

        rerender(
            <AutoSaveForm
                autoSaveProps={{ onChange, delay: 10 }}
                captureForm={captureForm}
            />
        )
        act(() => form.change('amount', 2))

        await advance(9)
        expect(onChange).not.toHaveBeenCalled()

        await advance(1)
        expect(onChange).toHaveBeenCalledWith({ amount: 2 })
    })

    /**
     * A SAVE THAT FAILS. The class, and the first version of the function component, kept a failed save's
     * promise in flight: every later save awaited it, rejected with it, and never saved, with the loader
     * on for good, and each later change added an unhandled rejection. Measured on 0.34.3 too, where the
     * class had the same shape. The failure is the host's to report, from its own save.
     */
    it('carries on after a failed save, and saves what failed with the next change', async () => {
        const onChange = jest.fn()
            .mockImplementationOnce(() => Promise.reject(new Error('network down')))
            .mockResolvedValue(undefined)
        let form
        render(
            <AutoSaveForm
                autoSaveProps={{ onChange, partial: true, delay: 20, showLoader: true }}
                captureForm={value => { form = value }}
            />
        )
        await advance(20)

        act(() => form.change('amount', 2))
        await advance(20)
        await advance(0)
        expect(onChange).toHaveBeenCalledTimes(1)
        expect(screen.queryByText('Syncing...')).not.toBeInTheDocument()

        // Partial: the change that failed is sent again, beside the new one.
        act(() => form.change('note', 'x'))
        await advance(20)
        await advance(0)
        expect(onChange).toHaveBeenCalledTimes(2)
        expect(onChange.mock.calls[1][0]).toEqual({ amount: 2, note: 'x' })
        expect(screen.queryByText('Syncing...')).not.toBeInTheDocument()
    })

    it('does not let a save that fails while another waits take that one down with it', async () => {
        // The waiting save awaited the failed one and rejected with it, so its change was never sent.
        const firstSave = deferred()
        const failing = firstSave.promise.then(() => { throw new Error('network down') })
        const onChange = jest.fn()
            .mockImplementationOnce(() => failing)
            .mockResolvedValue(undefined)
        let form
        render(
            <AutoSaveForm
                autoSaveProps={{ onChange, partial: true, delay: 20, showLoader: true }}
                captureForm={value => { form = value }}
            />
        )
        await advance(20)

        act(() => form.change('amount', 2))
        await advance(20)
        expect(onChange).toHaveBeenCalledTimes(1)

        act(() => form.change('note', 'x'))
        await advance(20)
        expect(onChange).toHaveBeenCalledTimes(1)

        await act(async () => {
            firstSave.resolve()
            await failing.catch(() => undefined)
            await Promise.resolve()
            await Promise.resolve()
        })

        expect(onChange).toHaveBeenCalledTimes(2)
        // Diffed against the baseline from before the failure, so it sends the failed change too.
        expect(onChange.mock.calls[1][0]).toEqual({ amount: 2, note: 'x' })
        expect(screen.queryByText('Syncing...')).not.toBeInTheDocument()
    })

    it('saves one at a time, however many changes wait for the save in flight', async () => {
        // Two changes waiting for the same save woke together and saved at once, so the older one could reach
        // the server last. 0.34.3 had the same single check.
        const saves = [deferred(), deferred(), deferred()]
        let calls = 0
        let running = 0
        let most = 0
        const onChange = jest.fn(() => {
            running += 1
            most = Math.max(most, running)
            const save = saves[calls++]
            return save.promise.then(() => { running -= 1 })
        })
        let form
        render(
            <AutoSaveForm autoSaveProps={{ onChange, delay: 20 }} captureForm={value => { form = value }}/>
        )
        await advance(20)

        act(() => form.change('amount', 2))
        await advance(20)
        act(() => form.change('amount', 3))
        await advance(20)
        act(() => form.change('amount', 4))
        await advance(20)
        expect(onChange).toHaveBeenCalledTimes(1)

        const settle = async index => {
            await act(async () => {
                saves[index].resolve()
                for (let i = 0; i < 5; i += 1) await Promise.resolve()
            })
        }
        await settle(0)
        expect(onChange).toHaveBeenCalledTimes(2)
        await settle(1)
        expect(onChange).toHaveBeenCalledTimes(3)
        await settle(2)

        expect(most).toBe(1)
        expect(onChange.mock.calls.map(([values]) => values.amount)).toEqual([2, 3, 4])
    })

    it('treats a save that throws as one that fails', async () => {
        // A save that threw rather than rejecting skipped the recovery: the loader stayed on and, with
        // `partial`, the change was never sent again.
        const onChange = jest.fn()
            .mockImplementationOnce(() => { throw new Error('no such method') })
            .mockResolvedValue(undefined)
        let form
        render(
            <AutoSaveForm
                autoSaveProps={{ onChange, partial: true, delay: 20, showLoader: true }}
                captureForm={value => { form = value }}
            />
        )
        await advance(20)

        act(() => form.change('amount', 2))
        await advance(20)
        await advance(0)
        expect(screen.queryByText('Syncing...')).not.toBeInTheDocument()

        act(() => form.change('note', 'x'))
        await advance(20)
        await advance(0)
        expect(onChange).toHaveBeenCalledTimes(2)
        expect(onChange.mock.calls[1][0]).toEqual({ amount: 2, note: 'x' })
    })
})

