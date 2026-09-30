/**
 * THE DOCUMENT HOST DOES WHAT REACT DID FOR THE CLASS.
 * =============================================================================================
 *
 * `hostDocument` replaces React's class component for the engine's document (§9.3 step 6, slice 6),
 * so the one thing worth pinning about it is that nothing can tell the difference. The same probe
 * is written twice, once on `React.Component` with `UNSAFE_componentWillReceiveProps` and once on
 * `DocumentInstance` with `deriveFromProps`. The same script runs through both, and every call
 * React or the host makes to it, and every state it renders with, is logged. The logs must be the
 * same. It runs on React 16, 17 and 18, so legacy batching is covered as well as the new one.
 */
import React, { Component, createContext } from 'react'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { DocumentInstance, hostDocument } from '../documentHost'

const ProbeContext = createContext('none')

/** One probe class on `Base`, logging to `log`. `receive` is the name its props hook goes by. */
function defineProbe (Base, receive, log, instances) {
    class Probe extends Base {
        constructor (props) {
            super(props)
            this.state = { count: 0, fromProps: props.value }
            instances.push(this)
            log.push(`constructor value=${props.value}`)
        }

        componentDidMount () {
            log.push(`didMount count=${this.state.count} context=${this.context}`)
        }

        componentDidUpdate (prevProps, prevState) {
            log.push(`didUpdate ${prevProps.value}/${prevState.count} -> ${this.props.value}/${this.state.count}`)
            if (this.state.count === 1 && !this.state.settled) {
                this.setState({ settled: true }, () => log.push(`settled callback settled=${this.state.settled}`))
            }
        }

        componentWillUnmount () {
            log.push(`willUnmount value=${this.props.value}`)
        }

        handleClick () {
            this.setState(state => ({ count: state.count + 1 }), () => log.push(`callback A count=${this.state.count}`))
            this.setState({ clicked: true }, () => log.push(`callback B clicked=${this.state.clicked}`))
            log.push(`after setState count=${this.state.count}`)
        }

        render () {
            log.push(`render value=${this.props.value} count=${this.state.count} fromProps=${this.state.fromProps} context=${this.context}`)
            return <button onClick={() => this.handleClick()}>{`count ${this.state.count}`}</button>
        }
    }
    Probe.prototype[receive] = function (next) {
        log.push(`receive ${this.props.value} -> ${next.value} count=${this.state.count} context=${this.context}`)
        if (next.value !== this.props.value) this.setState({ fromProps: next.value })
    }
    Probe.contextType = ProbeContext
    return Probe
}

/** The script, run against one probe; returns what was logged. */
async function runScript (Probe, log, instances, { strict = false } = {}) {
    const Wrapper = strict ? React.StrictMode : React.Fragment
    // The element is reused on purpose where a step says so: the same element is the same props
    // object, so a new context alone reaches the document.
    const tree = (element, context = 'first') => (
        <Wrapper>
            <ProbeContext.Provider value={context}>
                {element}
            </ProbeContext.Provider>
        </Wrapper>
    )
    let element = <Probe value={1} />
    const view = render(tree(element))
    log.push('-- click')
    fireEvent.click(screen.getByRole('button'))
    log.push('-- new props')
    element = <Probe value={2} />
    view.rerender(tree(element))
    log.push('-- equal props, new object')
    element = <Probe value={2} />
    view.rerender(tree(element))
    log.push('-- new context, same props object')
    view.rerender(tree(element, 'second'))
    log.push('-- a state update and new props in one batch')
    element = <Probe value={4} />
    act(() => {
        instances[instances.length - 1].setState({ count: 3 })
        view.rerender(tree(element, 'second'))
    })
    log.push('-- forceUpdate')
    act(() => { instances[instances.length - 1].forceUpdate(() => log.push('force callback')) })
    log.push('-- setState outside a batch')
    await act(async () => {
        await new Promise(resolve => setTimeout(() => {
            instances[instances.length - 1].setState({ count: 5 }, () => log.push('timer callback'))
            log.push(`after timer setState count=${instances[instances.length - 1].state.count}`)
            resolve()
        }, 0))
    })
    log.push('-- unmount')
    view.unmount()
    return log
}

describe('a document instance hosted by a function component', () => {
    it('is called, and renders, exactly as React calls and renders the same class', async () => {
        const classLog = []
        const classInstances = []
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            await runScript(defineProbe(Component, 'UNSAFE_componentWillReceiveProps', classLog, classInstances), classLog, classInstances)
        } finally {
            errors.mockRestore()
        }

        const hostLog = []
        const hostInstances = []
        const Hosted = hostDocument(defineProbe(DocumentInstance, 'deriveFromProps', hostLog, hostInstances))
        await runScript(Hosted, hostLog, hostInstances)

        expect(hostLog).toEqual(classLog)
        // The script reaches the props hook for new props, for equal props in a new object, and for
        // a new context with the same props object, which is when React called it: the last two with
        // the context the last render had. And for new props batched with a state update, with the
        // state from before the update.
        expect(hostLog).toContain('receive 1 -> 2 count=1 context=first')
        expect(hostLog.filter(line => line === 'receive 2 -> 2 count=1 context=first')).toHaveLength(2)
        expect(hostLog).toContain('render value=2 count=1 fromProps=2 context=second')
        expect(hostLog).toContain('receive 2 -> 4 count=1 context=second')
    })

    it('does the same under StrictMode, apart from running its props hook with the rest of the render', async () => {
        // StrictMode constructs and renders twice, and mounts, unmounts and mounts again. It does that
        // to the class and to the host alike, though in a different order: a class is constructed
        // twice and then rendered twice, and a function component's body, which constructs, runs
        // twice. The props hook is render-phase code, so StrictMode runs it twice too, where it ran
        // `UNSAFE_componentWillReceiveProps` once. That is why it must set nothing but the document's
        // own state: twice, it sets the same.
        const classLog = []
        const classInstances = []
        const errors = jest.spyOn(console, 'error').mockImplementation(() => {})
        try {
            await runScript(defineProbe(Component, 'UNSAFE_componentWillReceiveProps', classLog, classInstances), classLog, classInstances, { strict: true })
        } finally {
            errors.mockRestore()
        }

        const hostLog = []
        const hostInstances = []
        const reported = []
        const hostErrors = jest.spyOn(console, 'error').mockImplementation((...args) => { reported.push(args.join(' ')) })
        try {
            const Hosted = hostDocument(defineProbe(DocumentInstance, 'deriveFromProps', hostLog, hostInstances))
            await runScript(Hosted, hostLog, hostInstances, { strict: true })
        } finally {
            hostErrors.mockRestore()
        }

        const doubled = /^(constructor|render|receive) /
        const count = (log, kind) => log.filter(line => line.startsWith(kind + ' ')).length
        expect(hostLog.filter(line => !doubled.test(line))).toEqual(classLog.filter(line => !doubled.test(line)))
        expect(reported).toEqual([])
        // How often StrictMode repeats render-phase work depends on the React version. React 19
        // reuses a function component's hooks for the second render of a mount, so the host is
        // constructed once where the class is constructed twice (measured in the React 19 advisory
        // job). Up to 18 that second render starts from fresh hooks, and the counts are the class's.
        if (Number(React.version.split('.')[0]) <= 18) {
            expect(count(hostLog, 'constructor')).toBe(count(classLog, 'constructor'))
            expect(count(hostLog, 'render')).toBe(count(classLog, 'render'))
            // Every derivation the class made, the host made twice, and alike.
            const receives = log => log.filter(line => line.startsWith('receive '))
            expect(receives(hostLog)).toEqual(receives(classLog).flatMap(line => [line, line]))
        }
    })

    it('renders again for an update that changes nothing, where React skipped the render', async () => {
        // The one difference, and a deliberate one. React skipped the render and `componentDidUpdate`
        // for `setState(null)`, or an updater returning null, and still called back after the commit.
        // The host renders, so that there is a commit to call back after; calling back without one
        // would mean calling from the render. The engine issues no such update: every one it makes
        // is an object, or an updater returning one.
        const log = []
        const instances = []
        const Hosted = hostDocument(defineProbe(DocumentInstance, 'deriveFromProps', log, instances))
        render(<Hosted value={1} />)
        log.length = 0

        act(() => { instances[0].setState(() => null, () => log.push('null callback')) })

        expect(log).toEqual([
            'render value=1 count=0 fromProps=1 context=none',
            'didUpdate 1/0 -> 1/0',
            'null callback',
        ])
    })

    it('carries the class\'s name and prop types, and the class itself', () => {
        class Named extends DocumentInstance {
            render () { return null }
        }
        Named.propTypes = { value: () => null }

        const Hosted = hostDocument(Named)

        expect(Hosted.displayName).toBe('Named')
        // The host is meant to carry the class's prop types, so reading them is the check itself.
        // eslint-disable-next-line react/forbid-foreign-prop-types
        expect(Hosted.propTypes).toBe(Named.propTypes)
        expect(Hosted.name).toBe('Named')
        expect(Hosted.InstanceClass).toBe(Named)
    })

    it('rejects a state update that is neither an object nor a function, as React does', () => {
        const instance = new DocumentInstance({})

        expect(() => instance.setState(7)).toThrow('setState(...): takes an object of state variables to update or a function which returns an object of state variables.')
    })
})
