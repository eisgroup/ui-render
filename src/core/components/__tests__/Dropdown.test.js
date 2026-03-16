import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Dropdown } from '../Dropdown'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

// Wrap in ConfigContext since Text component uses it
const renderDropdown = (props) =>
    render(
        <ConfigContext.Provider value={initialConfigState}>
            <Dropdown {...props} />
        </ConfigContext.Provider>
    )

const objectOptions = [
    { text: 'Option A', value: 'a' },
    { text: 'Option B', value: 'b' },
    { text: 'Option C', value: 'c' },
]

describe('Dropdown', () => {
    describe('rendering', () => {
        it('renders without crashing', () => {
            const { container } = renderDropdown({ options: objectOptions })
            expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
        })

        it('renders with label', () => {
            renderDropdown({ options: objectOptions, label: 'Region' })
            expect(screen.getByText('Region')).toBeInTheDocument()
        })

        it('renders error message when error is provided', () => {
            renderDropdown({ options: objectOptions, error: 'Required field' })
            expect(screen.getByText('Required field')).toBeInTheDocument()
        })

        it('renders info message when info is provided', () => {
            renderDropdown({ options: objectOptions, info: 'Select a region' })
            expect(screen.getByText('Select a region')).toBeInTheDocument()
        })

        it('applies fill-width class by default', () => {
            const { container } = renderDropdown({ options: objectOptions })
            expect(container.firstChild).toHaveClass('fill-width')
        })

        it('removes fill-width class when fill=false', () => {
            const { container } = renderDropdown({ options: objectOptions, fill: false })
            expect(container.firstChild).not.toHaveClass('fill-width')
        })

        it('applies custom className', () => {
            const { container } = renderDropdown({ options: objectOptions, className: 'my-class' })
            expect(container.firstChild).toHaveClass('my-class')
        })

        it('applies inline style', () => {
            const { container } = renderDropdown({ options: objectOptions, style: { width: '300px' } })
            expect(container.firstChild).toHaveStyle({ width: '300px' })
        })

        it('renders float label after dropdown', () => {
            const { container } = renderDropdown({
                options: objectOptions,
                label: 'Float Label',
                float: true,
            })
            expect(container.firstChild).toHaveClass('float')
            expect(screen.getByText('Float Label')).toBeInTheDocument()
        })

        it('applies required class', () => {
            const { container } = renderDropdown({ options: objectOptions, required: true })
            expect(container.firstChild).toHaveClass('required')
        })

        it('applies readonly class and disables dropdown', () => {
            const { container } = renderDropdown({ options: objectOptions, readonly: true })
            expect(container.querySelector('.readonly')).toBeInTheDocument()
            expect(container.querySelector('.disabled')).toBeInTheDocument()
        })
    })

    describe('options handling', () => {
        it('converts string options to objects', () => {
            const { container } = renderDropdown({ options: ['Red', 'Green', 'Blue'] })
            expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
        })

        it('converts number options to objects', () => {
            const { container } = renderDropdown({ options: [10, 20, 30] })
            expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
        })

        it('handles object options with text and value', () => {
            const { container } = renderDropdown({ options: objectOptions })
            expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
        })
    })

    describe('value handling', () => {
        it('displays the selected value', () => {
            renderDropdown({ options: objectOptions, value: 'b' })
            expect(screen.getByText('Option B')).toBeInTheDocument()
        })

        it('uses first option as default when no value provided', () => {
            const { container } = renderDropdown({ options: objectOptions })
            // The dropdown should render with the first option value
            expect(container.querySelector('.ui.dropdown')).toBeInTheDocument()
        })
    })

    describe('onChange callback', () => {
        it('calls onChange when a selection is made', () => {
            const handleChange = jest.fn()
            const { container } = renderDropdown({
                options: objectOptions,
                onChange: handleChange,
                name: 'region',
                value: 'a',
            })

            // Simulate Semantic UI dropdown change by finding and clicking an option
            const dropdown = container.querySelector('.ui.dropdown')
            fireEvent.click(dropdown)

            // Find option item and click it
            const optionB = screen.getByText('Option B')
            fireEvent.click(optionB)

            expect(handleChange).toHaveBeenCalled()
        })
    })

    describe('cascading select behavior', () => {
        it('resets value when options change and current value is invalid', () => {
            const handleChange = jest.fn()
            const { rerender } = render(
                <ConfigContext.Provider value={initialConfigState}>
                    <Dropdown
                        options={objectOptions}
                        onChange={handleChange}
                        value="b"
                        name="test"
                    />
                </ConfigContext.Provider>
            )

            // Re-render with new options that don't include value 'b'
            const newOptions = [
                { text: 'Option X', value: 'x' },
                { text: 'Option Y', value: 'y' },
            ]

            act(() => {
                rerender(
                    <ConfigContext.Provider value={initialConfigState}>
                        <Dropdown
                            options={newOptions}
                            onChange={handleChange}
                            value="b"
                            name="test"
                        />
                    </ConfigContext.Provider>
                )
            })

            // onChange should be called with first valid option since 'b' is not in new options
            expect(handleChange).toHaveBeenCalledWith('x')
        })

        it('does NOT reset value when current value is still valid', () => {
            const handleChange = jest.fn()
            const { rerender } = render(
                <ConfigContext.Provider value={initialConfigState}>
                    <Dropdown
                        options={objectOptions}
                        onChange={handleChange}
                        value="b"
                        name="test"
                    />
                </ConfigContext.Provider>
            )

            // Re-render with options that still include value 'b'
            const newOptions = [
                { text: 'Option B', value: 'b' },
                { text: 'Option D', value: 'd' },
            ]

            act(() => {
                rerender(
                    <ConfigContext.Provider value={initialConfigState}>
                        <Dropdown
                            options={newOptions}
                            onChange={handleChange}
                            value="b"
                            name="test"
                        />
                    </ConfigContext.Provider>
                )
            })

            expect(handleChange).not.toHaveBeenCalled()
        })

        it('does NOT reset when value is empty', () => {
            const handleChange = jest.fn()
            const { rerender } = render(
                <ConfigContext.Provider value={initialConfigState}>
                    <Dropdown
                        options={objectOptions}
                        onChange={handleChange}
                        value=""
                        name="test"
                    />
                </ConfigContext.Provider>
            )

            act(() => {
                rerender(
                    <ConfigContext.Provider value={initialConfigState}>
                        <Dropdown
                            options={[{ text: 'X', value: 'x' }]}
                            onChange={handleChange}
                            value=""
                            name="test"
                        />
                    </ConfigContext.Provider>
                )
            })

            expect(handleChange).not.toHaveBeenCalled()
        })
    })

    describe('done state', () => {
        // Note: auto-calculated `done` relies on `props.value` from DropdownField wrapper (form integration).
        // When using Dropdown directly, `value` is destructured to `valueFromParent` and not in rest-props,
        // so done must be passed explicitly for standalone usage.

        it('applies done class when explicitly set to true', () => {
            const { container } = renderDropdown({
                options: objectOptions,
                value: 'a',
                done: true,
            })
            expect(container.firstChild).toHaveClass('done')
        })

        it('does NOT apply done class when explicitly set to false', () => {
            const { container } = renderDropdown({
                options: objectOptions,
                value: 'a',
                done: false,
            })
            expect(container.firstChild).not.toHaveClass('done')
        })

        it('does NOT auto-set done class in standalone mode (without form wrapper)', () => {
            const { container } = renderDropdown({
                options: objectOptions,
                value: 'a',
            })
            // In standalone mode, props.value is undefined so done auto-calculates to false
            expect(container.firstChild).not.toHaveClass('done')
        })

        it('does NOT set done class when error is present even if done=true', () => {
            const { container } = renderDropdown({
                options: objectOptions,
                value: 'a',
                error: 'Some error',
                done: false,
            })
            expect(container.firstChild).not.toHaveClass('done')
        })
    })

    describe('selection mode', () => {
        it('enables selection by default', () => {
            const { container } = renderDropdown({ options: objectOptions })
            expect(container.querySelector('.selection')).toBeInTheDocument()
        })

        it('enables deburr when search is enabled', () => {
            const { container } = renderDropdown({
                options: objectOptions,
                search: true,
            })
            expect(container.querySelector('.search')).toBeInTheDocument()
        })
    })
})
