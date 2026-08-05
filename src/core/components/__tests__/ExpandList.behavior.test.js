import React from 'react'
import { fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExpandList from '../ExpandList'
import { ConfigContext, initialConfigState } from '../../contexts/ConfigContext'

const wrap = ui => (
    <ConfigContext.Provider value={initialConfigState}>{ui}</ConfigContext.Provider>
)

describe('ExpandList rendering contracts', () => {
    it('defers item rendering until its row expands and passes the item index', () => {
        const items = [
            { id: 'first', name: 'Alpha' },
            { id: 'second', name: 'Beta' },
        ]
        const renderLabel = jest.fn((item, index) => `${index}:${item.name}`)
        const renderItem = jest.fn((item, index) => <span>{index}:{item.name} content</span>)
        const { container } = render(wrap(
            <ExpandList items={items} renderLabel={renderLabel} renderItem={renderItem}/>
        ))

        expect(renderLabel.mock.calls).toEqual([
            [items[0], 0],
            [items[1], 1],
        ])
        expect(renderItem).not.toHaveBeenCalled()

        fireEvent.click(container.querySelectorAll('.app__expand > .text')[1])

        expect(renderItem).toHaveBeenCalledTimes(1)
        expect(renderItem).toHaveBeenCalledWith(items[1], 1)
        expect(container).toHaveTextContent('1:Beta content')
    })

    it('renders an empty list without invoking either renderer', () => {
        const renderLabel = jest.fn()
        const renderItem = jest.fn()
        const { container } = render(wrap(
            <ExpandList items={[]} renderLabel={renderLabel} renderItem={renderItem}/>
        ))

        expect(container).toBeEmptyDOMElement()
        expect(renderLabel).not.toHaveBeenCalled()
        expect(renderItem).not.toHaveBeenCalled()
    })

    it('supports items without an explicit id by falling back to their position', () => {
        const { container } = render(wrap(
            <ExpandList
                items={[{ name: 'No id' }]}
                renderLabel={item => item.name}
                renderItem={() => 'content'}
            />
        ))

        expect(container.querySelectorAll('.app__expand')).toHaveLength(1)
        expect(container).toHaveTextContent('No id')
    })
})
