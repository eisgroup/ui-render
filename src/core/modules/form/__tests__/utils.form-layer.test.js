/**
 * THE FORM MODULE DOES NOT MUTATE THE CLASS IT DECORATES (§9.3 step 5).
 * =============================================================================================
 *
 * `withFormSetup` used to write ten members, `syncInputChanges`, a state shape and prop types
 * straight onto the class it was handed, and to REPLACE that class's own
 * `UNSAFE_componentWillReceiveProps` and `componentWillUnmount` with wrappers calling captured
 * copies. The class was a different object before and after, which is what the engine layer in
 * `rules.tsx` had already stopped doing to the class IT is handed.
 *
 * It now returns a subclass, and a caller must render what it returns: `withForm` does, and
 * publishes it as `WrappedComponent` for the engine, whose nested documents render it without the
 * wrapper. `rules.lifecycle-layer.test.js` pins the same facts on the engine's real chain.
 */
import React, { Component } from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { fieldValues, registeredFieldErrors, registeredFieldValues, withForm, withFormSetup } from '../utils'
import { Active } from '../../../utils'

const setup = { fieldValues, registeredFieldValues, registeredFieldErrors }

let originalRenderField
beforeAll(() => {
    originalRenderField = Active.renderField
    Active.renderField = Active.renderField || (() => null)
})
afterAll(() => {
    Active.renderField = originalRenderField
})

/** A class with its own lifecycle and state shape, both of which the layer used to overwrite. */
function declareClass () {
    const willReceiveProps = function () {}
    const willUnmount = function () {}
    class Declared extends Component {}
    Declared.prototype.UNSAFE_componentWillReceiveProps = willReceiveProps
    Declared.prototype.componentWillUnmount = willUnmount
    Declared.prototype.state = { declared: true }
    return { Declared, willReceiveProps, willUnmount }
}

describe('withFormSetup', () => {
    it('leaves the class it is handed exactly as written', () => {
        const { Declared, willReceiveProps, willUnmount } = declareClass()
        const ownBefore = Object.getOwnPropertyNames(Declared.prototype).sort()
        const { state } = Declared.prototype

        withFormSetup(Declared, setup)

        expect(Object.getOwnPropertyNames(Declared.prototype).sort()).toEqual(ownBefore)
        expect(Declared.prototype.UNSAFE_componentWillReceiveProps).toBe(willReceiveProps)
        expect(Declared.prototype.componentWillUnmount).toBe(willUnmount)
        expect(Declared.prototype.state).toBe(state)
    })

    it('returns a subclass carrying the form layer instead, named after the class it builds on', () => {
        const { Declared } = declareClass()

        const Layer = withFormSetup(Declared, setup)

        expect(Object.getPrototypeOf(Layer)).toBe(Declared)
        // Named like `asField`'s classes, so a warning or a component stack still says which one it is.
        expect(Layer.name).toBe('DeclaredWithFormSetup')
        expect(typeof Object.getOwnPropertyDescriptor(Layer.prototype, 'canSave').get).toBe('function')
        expect(typeof Object.getOwnPropertyDescriptor(Layer.prototype, 'syncInputChanges').value).toBe('function')
        expect(Layer.prototype.state).toEqual({ canSave: false, declared: true })
    })
})

describe('withForm', () => {
    it('renders the subclass, and publishes it as WrappedComponent', () => {
        // Rendered for real, with the default options: the wrapper is a function since §9.3 step 6,
        // so there is no instance to call `render` on.
        class Declared extends Component {
            render () {
                return <span data-testid='declared'>{this.constructor.name}:{String(this.props.formProps.pristine)}</span>
            }
        }

        const WithForm = withForm()(Declared)
        const Layer = WithForm.WrappedComponent

        expect(Object.getPrototypeOf(Layer)).toBe(Declared)

        render(<WithForm initialValues={{}} />)
        expect(screen.getByTestId('declared')).toHaveTextContent(`${Layer.name}:true`)
    })
})
