import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Image, imageSrc } from '../Image'
import { Placeholder } from '../Placeholder'
import { PlaceholderField } from '../PlaceholderField'
import { Space } from '../Space'
import { Tooltip } from '../Tooltip'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = (ui) => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

describe('Image', () => {
    it('renders an <img> with given src', () => {
        const { container } = render(<Image src="/foo.png" alt="Foo" />)
        const img = container.querySelector('img')
        expect(img).toBeInTheDocument()
        expect(img.getAttribute('src')).toBe('/foo.png')
        expect(img.getAttribute('alt')).toBe('Foo')
    })

    it('defaults alt to the filename without extension', () => {
        const { container } = render(<Image src="/foo.png" name="hello.png" />)
        expect(container.querySelector('img').getAttribute('alt')).toBe('hello')
    })

    it('builds src from path + name when src is not provided', () => {
        const { container } = render(<Image name="My Picture.png" path="/cdn/" />)
        expect(container.querySelector('img').getAttribute('src')).toBe('/cdn/my-picture.png')
    })
})

describe('imageSrc', () => {
    it('returns avatar if given', () => {
        expect(imageSrc({ avatar: '/a.png' })).toBe('/a.png')
    })
    it('returns src when given', () => {
        expect(imageSrc({ src: '/b.png' })).toBe('/b.png')
    })
    it('joins path + lowercased name with dashes', () => {
        expect(imageSrc({ name: 'My File.png', path: '/p/' })).toBe('/p/my-file.png')
    })
})

describe('Placeholder', () => {
    it('renders a View with placeholder classes', () => {
        const { container } = render(<Placeholder>x</Placeholder>)
        expect(container.querySelector('div').className).toContain('bg-texture-faded')
    })
})

describe('PlaceholderField', () => {
    it('renders a field-does-not-exist message when no children', () => {
        const { container } = render(wrap(<PlaceholderField name="missingField" />))
        expect(container.textContent.toLowerCase()).toContain('missingfield')
    })

    it('renders provided children instead', () => {
        const { container } = render(<PlaceholderField name="x">custom</PlaceholderField>)
        expect(container.textContent).toContain('custom')
    })

    it('renders without throwing when called with no args', () => {
        expect(() => render(wrap(<PlaceholderField />))).not.toThrow()
    })
})

describe('Space', () => {
    it('renders default space class', () => {
        const { container } = render(<Space />)
        expect(container.querySelector('div').className).toContain('space')
    })
    it('applies small modifier', () => {
        const { container } = render(<Space small />)
        expect(container.querySelector('div').className).toContain('space-small')
    })
    it('applies large modifier', () => {
        const { container } = render(<Space large />)
        expect(container.querySelector('div').className).toContain('space-large')
    })
})

describe('Tooltip', () => {
    it('renders a tooltip span with position classes', () => {
        const { container } = render(<Tooltip top show>Hi</Tooltip>)
        const cls = container.querySelector('span').className
        expect(cls).toContain('tooltip')
        expect(cls).toContain('top')
        expect(cls).toContain('show')
    })
})
