import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Active } from 'ui-utils-pack'
import Data from '../Data'

jest.mock('../components/LocalDraftTableRow', () => function MockLocalDraft (props) {
    return (
        <div
            data-testid="local-draft"
            data-kind={props.kind}
            data-relative-path={props.meta && props.meta.relativePath}
        />
    )
})

const tableCellsMeta = {
    view: 'TableCells',
    items: [
        { view: 'Input', name: 'periodName', type: 'text' },
        { view: 'Button', onClick: { name: 'addData' }, children: 'Add' },
    ],
}

describe('Data localDraft', () => {
    const instance = { getDataKind: () => [] }

    it('renders LocalDraftTableRow when localDraft and Data wraps TableCells', () => {
        render(
            <Data
                kind="experiencePeriods"
                instance={instance}
                localDraft
                relativePath="dataKind.experiencePeriods"
                relativeIndex={3}
                meta={{
                    view: 'Data',
                    meta: tableCellsMeta,
                }}
            />
        )
        const el = screen.getByTestId('local-draft')
        expect(el).toBeInTheDocument()
        expect(el).toHaveAttribute('data-kind', 'experiencePeriods')
        expect(el).toHaveAttribute('data-relative-path', 'dataKind.experiencePeriods')
    })

    it('renders LocalDraftTableRow when top-level meta is TableCells', () => {
        render(
            <Data
                kind="k"
                instance={instance}
                localDraft
                relativePath="dataKind.k"
                relativeIndex={0}
                meta={tableCellsMeta}
            />
        )
        expect(screen.getByTestId('local-draft')).toBeInTheDocument()
    })

    it('does not use LocalDraft when localDraft is false', () => {
        const Original = Active.UIRender
        Active.UIRender = function MockUIRender () {
            return <div data-testid="ui-render" />
        }
        try {
            render(
                <Data
                    kind="k"
                    instance={instance}
                    meta={tableCellsMeta}
                />
            )
            expect(screen.queryByTestId('local-draft')).not.toBeInTheDocument()
            expect(screen.getByTestId('ui-render')).toBeInTheDocument()
        } finally {
            Active.UIRender = Original
        }
    })

    it('falls through to UIRender when localDraft but inner meta is not TableCells', () => {
        const Original = Active.UIRender
        Active.UIRender = function MockUIRender () {
            return <div data-testid="ui-render-fallback" />
        }
        try {
            render(
                <Data
                    kind="k"
                    instance={instance}
                    localDraft
                    meta={{
                        view: 'Data',
                        meta: { view: 'Row', items: [] },
                    }}
                />
            )
            expect(screen.queryByTestId('local-draft')).not.toBeInTheDocument()
            expect(screen.getByTestId('ui-render-fallback')).toBeInTheDocument()
        } finally {
            Active.UIRender = Original
        }
    })
})
