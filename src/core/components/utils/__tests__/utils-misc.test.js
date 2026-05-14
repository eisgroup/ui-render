import React from 'react'
import { cssBgImageFrom } from '../img'
import { isClass, getOriginalClass } from '../react'
import { tooltipProps, dropdownPopup } from '../components'

describe('cssBgImageFrom', () => {
    it('wraps a URL with url() and encodes it', () => {
        expect(cssBgImageFrom('https://example.com/img.png')).toBe(
            "url('https://example.com/img.png')"
        )
    })
    it('treats strings without a dot as base64 data', () => {
        expect(cssBgImageFrom('iVBORw0KGgo')).toBe("url('iVBORw0KGgo')")
    })
    it('URI-encodes spaces in URLs', () => {
        expect(cssBgImageFrom('http://a.com/my file.png')).toBe(
            "url('http://a.com/my%20file.png')"
        )
    })
})

describe('isClass', () => {
    it('returns true for ES6 class components with render()', () => {
        class Foo extends React.Component {
            render () { return null }
        }
        expect(isClass(Foo)).toBe(true)
    })
    it('returns false for stateless function components', () => {
        const Foo = () => null
        expect(isClass(Foo)).toBe(false)
    })
})

describe('getOriginalClass', () => {
    it('returns the component itself when it is already a class', () => {
        class Foo extends React.Component {
            render () { return null }
        }
        expect(getOriginalClass(Foo)).toBe(Foo)
    })
    it('returns the inner class when wrapped under .Class', () => {
        class Inner extends React.Component {
            render () { return null }
        }
        const Wrapped = () => null
        Wrapped.Class = Inner
        expect(getOriginalClass(Wrapped)).toBe(Inner)
    })
    it('returns false when wrapped .Class is also a function (not a class)', () => {
        const Foo = () => null
        Foo.Class = () => null
        expect(getOriginalClass(Foo)).toBe(false)
    })
})

describe('tooltipProps', () => {
    it('wraps a string in {title}', () => {
        expect(tooltipProps('hello')).toEqual({ title: 'hello' })
    })
    it('wraps a number in {title}', () => {
        expect(tooltipProps(42)).toEqual({ title: 42 })
    })
    it('passes through an object', () => {
        expect(tooltipProps({ title: 'x', position: 'top' })).toEqual({
            title: 'x',
            position: 'top',
        })
    })
    it('merges default props', () => {
        expect(tooltipProps('hi', { position: 'top' })).toEqual({
            position: 'top',
            title: 'hi',
        })
    })
})

describe('dropdownPopup', () => {
    it('exposes expected hoverable basic config', () => {
        expect(dropdownPopup.basic).toBe(true)
        expect(dropdownPopup.position).toBe('bottom center')
        expect(dropdownPopup.hoverable).toBe(true)
    })
})
