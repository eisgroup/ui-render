import { autoSubmitter, cancelAutoSubmit } from '../autoSubmit'

describe('auto-submit lifetime', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    afterEach(() => {
        jest.clearAllTimers()
        jest.useRealTimers()
    })

    const makeInstance = () => {
        const calls = []
        return { calls, submit: (...args) => calls.push(args) }
    }

    it('hands back the same debounced submit for the same delay', () => {
        const instance = makeInstance()

        const first = autoSubmitter(instance, 300)
        const second = autoSubmitter(instance, 300)

        expect(second).toBe(first)

        first()
        second()
        jest.runOnlyPendingTimers()

        expect(instance.calls).toHaveLength(1)
    })

    it('keeps one debounced submit per delay, so nodes do not evict each other', () => {
        // A meta may declare `autoSubmit` on several nodes with different delays. With a single
        // slot per instance they would replace each other on every render pass — the original
        // defect, made worse.
        const instance = makeInstance()

        const slow = autoSubmitter(instance, 5000)
        const fast = autoSubmitter(instance, 100)

        expect(fast).not.toBe(slow)
        expect(autoSubmitter(instance, 5000)).toBe(slow)
        expect(autoSubmitter(instance, 100)).toBe(fast)

        slow()
        fast()
        jest.runOnlyPendingTimers()

        expect(instance.calls).toHaveLength(2)
    })

    it('drops a pending submit when the instance goes away', () => {
        const instance = makeInstance()

        autoSubmitter(instance, 300)()
        cancelAutoSubmit(instance)
        jest.runOnlyPendingTimers()

        expect(instance.calls).toHaveLength(0)
    })

    it('drops pending submits at every delay when the instance goes away', () => {
        const instance = makeInstance()

        autoSubmitter(instance, 100)()
        autoSubmitter(instance, 5000)()
        cancelAutoSubmit(instance)
        jest.runOnlyPendingTimers()

        expect(instance.calls).toHaveLength(0)
    })

    it('cancels nothing on an instance that never auto-submitted', () => {
        const instance = makeInstance()

        expect(() => cancelAutoSubmit(instance)).not.toThrow()
    })
})
