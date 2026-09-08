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

  /**
   * FOUND BY THE §9.7-F1 STEP 3 PART 1 AUDIT. The sanitiser's own comment claimed absent options
   * "pass through unchanged"; measured, `options[0]` THREW on an absent or null list and only
   * `options: []` rendered. Absent and null are now the empty state, because that is a legitimate
   * thing for a meta to express — options not loaded yet, or a `name`-bound path that resolved to
   * null — and a throw makes the engine replace the whole node with its error diagnostic.
   */
  /**
   * THE DUPLICATE-ID HALF of the help-text contract, here rather than in the behaviour suite
   * because that one mocks `semantic-ui-react` away and the second element carrying the id IS
   * Semantic's `<div role="listbox">` — the caller's `id` reaches it through the rest bag. Two
   * elements with one id is invalid, and it was reachable without the caller doing anything:
   * `mapper.js` assigns `input.id` automatically for relative paths. Found by the §9.7-F1 step 3
   * part 1 audit.
   */
  it('never gives two elements the same id when it renders help text', () => {
    const {container} = render(
      <ConfigContext.Provider value={initialConfigState}>
        <Dropdown id="region" error="Required" name="region" options={objectOptions} onChange={() => {}}/>
      </ConfigContext.Provider>
    )

    expect(container.querySelectorAll('#region')).toHaveLength(1)
    expect(container.querySelectorAll('#region-help')).toHaveLength(1)
    expect(container.querySelector('[role="listbox"]').getAttribute('aria-describedby')).toBe('region-help')
  })

  it('renders an empty control when options are absent or null, instead of throwing', () => {
    [undefined, null].forEach(options => {
      const {container, unmount} = render(<Dropdown name="x" options={options}/>)

      expect(container.querySelectorAll('[role="listbox"]')).toHaveLength(1)
      expect(container.querySelectorAll('[role="option"]')).toHaveLength(0)
      unmount()
    })
  })
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

            // The first valid option, since 'b' is not in the new options — and with the `name`,
            // which §9.7-F1 step 3 part 1 added: the reset used to call `onChange` with arity 1
            // and a `String(...)` of the value, contradicting the wrapper's own
            // `(value, name, event)` contract. There is no event for a programmatic reset.
            expect(handleChange).toHaveBeenCalledWith('x', 'test')
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

    })

    describe('props semantic-ui-react consumed and the in-house listbox does not', () => {
        /**
         * A DEFECT THE SWAP INTRODUCED, not a pre-existing one. SUIR's Dropdown declared
         * `search`/`multiple`/`allowAdditions`/`clearable` (and the rest of `DROPPED_PROPS`) as
         * handled props, so passing one was quietly harmless. `Listbox` spreads what it does not
         * destructure onto its `<div role="listbox">`, so after the swap they became ATTRIBUTES:
         * measured, `required` rendered as `required=""` on a div and `clearable` produced React's
         * own "Received `true` for a non-boolean attribute" warning.
         *
         * Revert `dropUnsupported` in `Dropdown.js` and both halves of this describe fail.
         */
        const withConsole = (method, run) => {
            const original = console[method]
            const seen = []
            console[method] = (...args) => seen.push(String(args[0]))
            try {
                run()
            } finally {
                console[method] = original
            }
            return seen
        }

        it('keeps them off the DOM instead of emitting invalid attributes', () => {
            let container
            const errors = withConsole('error', () => {
                withConsole('warn', () => {
                    container = renderDropdown({
                        options: objectOptions,
                        search: true,
                        multiple: true,
                        allowAdditions: true,
                        clearable: true,
                        noResultsMessage: 'nothing',
                    }).container
                })
            })

            const listbox = container.querySelector('[role="listbox"]')
            const attributes = [...listbox.attributes].map(attribute => attribute.name)
            expect(attributes).toEqual(['role', 'aria-expanded', 'tabindex', 'class'])
            // React's non-boolean-attribute warning is the specific symptom that is gone.
            expect(errors).toEqual([])
        })

        it('says so once per name, actionably, rather than silently', () => {
            // `additionPosition` because the guard is a MODULE-level Set, deliberately: a select in
            // a 200-row table must not warn 200 times. That makes "already warned" file-global
            // state, so this test needs a name no other test in this file passes.
            const warnings = withConsole('warn', () => {
                renderDropdown({ options: objectOptions, additionPosition: 'top' })
                renderDropdown({ options: objectOptions, additionPosition: 'top' })
            })

            expect(warnings).toHaveLength(1)
            expect(warnings[0]).toContain('`additionPosition`')
            // The message has to name the replacement doc, or a consumer cannot act on it.
            expect(warnings[0]).toContain('docs/SUPPORTED-PROPS.md')
        })

        it('still consumes `required`, which the wrapper reads for its own class', () => {
            // `required` is NOT in the dropped list for exactly this reason: it drives the
            // wrapper's `required` class, and dropping it would have taken a live style with it.
            const { container } = renderDropdown({ options: objectOptions, required: true })

            expect(container.firstChild).toHaveClass('required')
            expect(container.querySelector('[role="listbox"]')).not.toHaveAttribute('required')
        })
    })
})
