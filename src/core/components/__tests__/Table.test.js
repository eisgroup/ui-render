import React from 'react'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import Table from '../Table'

describe('Table', () => {
    it('renders a plain semantic-ui Table by default', () => {
        const { container } = render(
            <Table>
                <Table.Header><Table.Row><Table.HeaderCell>X</Table.HeaderCell></Table.Row></Table.Header>
                <Table.Body><Table.Row><Table.Cell>1</Table.Cell></Table.Row></Table.Body>
            </Table>
        )
        expect(container.querySelector('table')).toBeInTheDocument()
        expect(container.textContent).toContain('X')
    })

    it('wraps in fixed-header container when fixedHeader=true', () => {
        const { container } = render(
            <Table fixedHeader>
                <Table.Body><Table.Row><Table.Cell>x</Table.Cell></Table.Row></Table.Body>
            </Table>
        )
        expect(container.querySelector('.app__table__container--fixed-header')).toBeInTheDocument()
        expect(container.querySelector('.app__table__container__inner--fixed-header')).toBeInTheDocument()
    })

    it('exposes Header/HeaderCell/Row/Cell/Body/Footer as statics', () => {
        expect(Table.Header).toBeDefined()
        expect(Table.HeaderCell).toBeDefined()
        expect(Table.Row).toBeDefined()
        expect(Table.Cell).toBeDefined()
        expect(Table.Body).toBeDefined()
        expect(Table.Footer).toBeDefined()
    })
})
