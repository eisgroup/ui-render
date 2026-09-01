import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'
import { ENGINE_PROPS, FIELD_ONLY_PROPS, omitProps } from '../domProps'
import Text from '../Text'
import View from '../View'
import Row from '../Row'
import Label from '../Label'
import Button from '../Button'
import Dropzone from '../Dropzone'
import ScrollView from '../ScrollView'
import InputNative from '../InputNative'
import InputNumber from '../InputNumber'
import Checkbox from '../Checkbox'
import Slider from '../Slider'
import Icon from '../Icon'
import Image from '../Image'
import Tooltip from '../Tooltip'

/**
 * THE DOM BOUNDARY, ENFORCED
 * -----------------------------------------------------------------------------
 * `domProps.js` only works if every component that spreads a props bag onto a DOM
 * element actually applies it, so this asserts the boundary per primitive rather
 * than trusting the module in isolation. The corpus-wide counterpart is the
 * counted-zero tripwire in examples.dom-contract.test.js; this is the unit-level
 * one, and it fails for a NEW component that forgets the filter only if that
 * component is added here — which is what the "keep this list current" note in
 * domProps.js is asking for.
 *
 * The `name`/`label` half is the part worth care: it must NOT be stripped on the
 * form-control family. `keeps `name` on a form control` below is the guard, and the
 * corpus-level guard is examples.behavior-contract's FORM_BINDINGS round-trip.
 */

/** One string value per listed key, so a leak shows up as a real attribute. */
const leakyProps = (...lists) => [].concat(...lists)
    .reduce((props, key) => ({ ...props, [key]: `leaked-${key}` }), {})

const attributeNames = element => element.getAttributeNames()

const expectNoneOf = (element, keys) => {
    const present = keys.map(key => key.toLowerCase())
        .filter(key => attributeNames(element).indexOf(key) !== -1)
    expect(present).toEqual([])
}

describe('omitProps', () => {
    it('returns the SAME object when no listed key is present, so a clean render allocates nothing', () => {
        const props = { className: 'a', onClick: () => {} }

        expect(omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)).toBe(props)
    })

    it('removes the listed keys and leaves everything else, without mutating the input', () => {
        const onClick = () => {}
        const props = { className: 'a', onClick, view: 'Text', name: 'total', label: 'Total' }

        const kept = omitProps(props, ENGINE_PROPS, FIELD_ONLY_PROPS)

        expect(kept).toEqual({ className: 'a', onClick })
        expect(kept).not.toBe(props)
        // props is a destructuring rest object owned by the caller; filtering must not touch it
        expect(Object.keys(props).sort()).toEqual(['className', 'label', 'name', 'onClick', 'view'])
    })

    it('removes only the one list it was given', () => {
        const props = { view: 'Text', name: 'total' }

        expect(omitProps(props, ENGINE_PROPS)).toEqual({ name: 'total' })
        expect(omitProps(props, FIELD_ONLY_PROPS)).toEqual({ view: 'Text' })
    })

    it('keeps a falsy value that is not a listed key', () => {
        const props = { disabled: false, value: 0, index: 3 }

        expect(omitProps(props, ENGINE_PROPS)).toEqual({ disabled: false, value: 0 })
    })
})

describe('DOM boundary per component', () => {
    const containers = [
        ['Text renders a <span>', <Text {...leakyProps(ENGINE_PROPS, FIELD_ONLY_PROPS)} />, 'span'],
        ['View renders a <div>', <View {...leakyProps(ENGINE_PROPS, FIELD_ONLY_PROPS)} />, 'div'],
        ['Row renders a <div>', <Row {...leakyProps(ENGINE_PROPS, FIELD_ONLY_PROPS)} />, 'div'],
        ['Label renders a <label>', <Label {...leakyProps(ENGINE_PROPS, FIELD_ONLY_PROPS)} />, 'label'],
        ['Dropzone renders a <div>', <Dropzone {...leakyProps(ENGINE_PROPS, FIELD_ONLY_PROPS)} />, 'div'],
        [
            'ScrollView renders a <div>',
            <ScrollView {...leakyProps(ENGINE_PROPS, FIELD_ONLY_PROPS)}><span/></ScrollView>,
            'div',
        ],
    ]

    it.each(containers)('%s with no engine prop and no field-only attribute', (_name, ui, tag) => {
        const { container } = render(
            <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
        )

        const elements = container.querySelectorAll(tag)
        expect(elements.length).toBeGreaterThan(0)
        elements.forEach(element => expectNoneOf(element, [...ENGINE_PROPS, ...FIELD_ONLY_PROPS]))
    })

    it('Button renders a <button> with no engine prop', () => {
        const { container } = render(<Button {...leakyProps(ENGINE_PROPS)} />)

        expectNoneOf(container.querySelector('button'), ENGINE_PROPS)
    })

    it('InputNative renders an <input> with no engine prop', () => {
        const { container } = render(<InputNative {...leakyProps(ENGINE_PROPS)} />)

        expectNoneOf(container.querySelector('input'), ENGINE_PROPS)
    })

    /**
     * THE TRAP. `name` is both an engine-internal renderer selector and the
     * react-final-form field registration path. A boundary filter that took it off a
     * form control would break every form in the library, and silently: the markup
     * still renders. This is the line the two lists exist to draw.
     */
    it('keeps `name` on a form control while removing it from a container', () => {
        const { container } = render(
            <div>
                <InputNative name="customer.total" type="text" />
                <View name="customer.total" />
            </div>
        )

        expect(container.querySelector('input')).toHaveAttribute('name', 'customer.total')
        expect(container.querySelector('div > div')).not.toHaveAttribute('name')
    })
})

/**
 * The four boundaries added after review. The 38-example DOM baseline could not see these:
 * no example passes an engine prop to a slider or a checkbox, so the corpus counted zero
 * while the boundary was genuinely open. Verified by reverting each strip in turn — each
 * case fails without it.
 */
describe('DOM boundary: the form-control and slider family', () => {
    const ENGINE = { index: 'ZZIDX', symbol: 'ZZSYM', view: 'ZZVIEW', _comment: 'ZZC' }
    const LEGITIMATE = { title: 'KEEP_TITLE', 'data-testid': 'keep-me', 'aria-label': 'KEEP_ARIA' }
    const engineMarkers = html => ['ZZIDX', 'ZZSYM', 'ZZVIEW', 'ZZC', '[object Object]']
        .filter(marker => html.includes(marker))

    it('InputNumber strips engine props, keeps the field name', () => {
        const { container } = render(
            <InputNumber name="customer.qty" {...ENGINE} {...LEGITIMATE} onChange={() => {}} />
        )
        expect(engineMarkers(container.innerHTML)).toEqual([])
        expect(container.querySelector('input')).toHaveAttribute('name', 'customer.qty')
        expect(container.querySelector('input')).toHaveAttribute('title', 'KEEP_TITLE')
    })

    it('Checkbox strips engine props, keeps the field name', () => {
        const { container } = render(
            <Checkbox id="agree" name="customer.agree" {...ENGINE} {...LEGITIMATE} onChange={() => {}} />
        )
        expect(engineMarkers(container.innerHTML)).toEqual([])
        expect(container.querySelector('input')).toHaveAttribute('name', 'customer.agree')
    })

    // A generic <div>, so both lists apply -- `label` on a div is the case the split exists for.
    it('Slider strips engine props and field-only props from its container', () => {
        const { container } = render(
            <Slider label="Volume" name="settings.volume" {...ENGINE} {...LEGITIMATE} onChange={() => {}} />
        )
        const slider = container.querySelector('.app__slider')
        expect(engineMarkers(container.innerHTML)).toEqual([])
        expectNoneOf(slider, [...ENGINE_PROPS, ...FIELD_ONLY_PROPS])
        expect(slider).toHaveAttribute('title', 'KEEP_TITLE')
    })
})

/**
 * Three more boundaries found by auditing every spread onto a DOM tag rather than trusting
 * the corpus. All three are reachable from meta (`mapper.js` resolves them), all three leaked,
 * and none of it showed in the 38-example baseline because no example passes an engine prop
 * to an icon, an image or a bare tooltip.
 */
describe('DOM boundary: icon, image and tooltip', () => {
    const ENGINE = { index: 'ZZIDX', symbol: 'ZZSYM', view: 'ZZVIEW', _comment: 'ZZC' }
    const engineMarkers = html => ['ZZIDX', 'ZZSYM', 'ZZVIEW', 'ZZC'].filter(m => html.includes(m))

    it('Icon renders an <i> with no engine props', () => {
        const { container } = render(<Icon name="search" {...ENGINE} />)
        expect(engineMarkers(container.innerHTML)).toEqual([])
        // `name` is consumed to pick the icon class, so it must still do that.
        expect(container.querySelector('i')).toHaveClass('icon-search')
    })

    it('Image renders an <img> with no engine props, keeping src and alt', () => {
        const { container } = render(<Image name="photo.png" {...ENGINE} />)
        const img = container.querySelector('img')
        expect(engineMarkers(container.innerHTML)).toEqual([])
        // `name` is consumed to derive both, so stripping it at the edge must not lose them.
        expect(img).toHaveAttribute('src')
        expect(img).toHaveAttribute('alt', 'photo')
    })

    it('Tooltip renders a <span> with no engine props', () => {
        const { container } = render(<Tooltip {...ENGINE}>content</Tooltip>)
        expect(engineMarkers(container.innerHTML)).toEqual([])
        expect(container.querySelector('span')).toHaveTextContent('content')
    })
})
