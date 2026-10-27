import {
    changeOptionOrderForSelectFields,
    getFormsData,
    getRawFormsData,
    getLiveMergedDataKindArray,
    holdsFields,
    restartWrittenRows,
    rowPlaceOf,
} from '../formData'

/**
 * A form as the merge reads it: its values, the fields it registers and the values it started with, which a table
 * row's own form gives: the values of the fields it changed.
 */
function makeForm(values, fields = [], initialValues = {}) {
    return {
        getState: () => ({ values, initialValues }),
        getRegisteredFields: () => fields,
    }
}

describe('getLiveMergedDataKindArray', () => {
    it('returns [] when no form holds the path', () => {
        const forms = new Map([
            ['f1', { form: makeForm({ other: 'x' }), meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([])
    })

    it('merges per-row data across forms', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [{ a: 1 }, { a: 2 }] }), meta: {} }],
            ['b', { form: makeForm({ items: [{ b: 10 }, { b: 20 }] }), meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([
            { a: 1, b: 10 },
            { a: 2, b: 20 },
        ])
    })

    it('later forms win on conflicting keys', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [{ x: 1 }] }), meta: {} }],
            ['b', { form: makeForm({ items: [{ x: 2 }] }), meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ x: 2 }])
    })

    it('caps result length to the shortest non-empty array', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [{ a: 1 }, { a: 2 }, { a: 3 }] }), meta: {} }],
            ['b', { form: makeForm({ items: [{ b: 1 }] }), meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 1, b: 1 }])
    })

    it('skips forms without getState', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [{ a: 1 }] }), meta: {} }],
            ['b', { form: {}, meta: {} }],
        ])
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 1 }])
    })

    it('returns empty objects for null entries', () => {
        const forms = new Map([
            ['a', { form: makeForm({ items: [null, { x: 1 }] }), meta: {} }],
        ])
        const out = getLiveMergedDataKindArray('items', forms)
        expect(out).toHaveLength(2)
        expect(out[0]).toEqual({})
        expect(out[1]).toEqual({ x: 1 })
    })

    describe('the merge kept between calls, and the form a validator runs in', () => {
        /** A form as the merge reads it, counting how often its whole state is computed. */
        function countedForm (values, fields = [], initialValues = {}) {
            const form = {
                reads: 0,
                values,
                fields,
                initialValues,
                getState () {
                    form.reads += 1
                    return { values: form.values, initialValues: form.initialValues }
                },
                getFieldState: name => form.fields.indexOf(name) === -1 ? undefined : { name },
                getRegisteredFields: () => form.fields.slice(),
            }
            return form
        }

        it('gives the same rows while every form holds the same array, in an array of each call\'s own', () => {
            const forms = new Map([
                ['a', { form: countedForm({ items: [{ a: 1 }, { a: 2 }] }), meta: {} }],
                ['b', { form: countedForm({ items: [{ b: 1 }, { b: 2 }] }), meta: {} }],
            ])
            const first = getLiveMergedDataKindArray('items', forms)
            const second = getLiveMergedDataKindArray('items', forms)
            expect(second).toEqual([{ a: 1, b: 1 }, { a: 2, b: 2 }])
            expect([second === first, second[0] === first[0]]).toEqual([false, true])
        })

        it('merges again once a form holds another array', () => {
            const form = countedForm({ items: [{ a: 1 }] })
            const forms = new Map([['a', { form, meta: {} }]])
            const first = getLiveMergedDataKindArray('items', forms)
            form.values = { items: [{ a: 2 }] }
            const second = getLiveMergedDataKindArray('items', forms)
            expect(second).toEqual([{ a: 2 }])
            expect(second[0]).not.toBe(first[0])
        })

        it('merges again once a later form holds another array, though the first form holds the same', () => {
            const first = countedForm({ items: [{ a: 1 }] })
            const later = countedForm({ items: [{ b: 1 }] })
            const forms = new Map([['first', { form: first, meta: {} }], ['later', { form: later, meta: {} }]])
            getLiveMergedDataKindArray('items', forms)
            later.values = { items: [{ b: 2 }] }
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 1, b: 2 }])
        })

        it('reads the form a validator runs in from the values it was handed, and computes the others\' state', () => {
            const edited = countedForm({ items: [{ a: 'before the change' }] }, ['items[0].a'])
            const other = countedForm({ items: [{ b: 1 }] })
            const forms = new Map([['edited', { form: edited, meta: {} }], ['other', { form: other, meta: {} }]])
            const handed = { items: [{ a: 'after the change' }] }
            expect(getLiveMergedDataKindArray('items', forms, { form: edited, name: 'items[0].a', values: handed }))
                .toEqual([{ a: 'after the change', b: 1 }])
            expect([edited.reads, other.reads]).toEqual([0, 1])
        })

        it('tells that form by its methods, as react-final-form hands a new object of it on each render', () => {
            const edited = countedForm({ items: [{ a: 1 }] }, ['items[0].a'])
            const forms = new Map([['edited', { form: edited, meta: {} }]])
            getLiveMergedDataKindArray('items', forms, { form: { ...edited }, name: 'items[0].a', values: { items: [{ a: 2 }] } })
            expect(edited.reads).toBe(0)
        })

        it('computes the state of a form that does not register the field', () => {
            const form = countedForm({ items: [{ a: 'its own' }] })
            const forms = new Map([['a', { form, meta: {} }]])
            expect(getLiveMergedDataKindArray('items', forms, { form, name: 'items[0].a', values: { items: [{ a: 'handed' }] } }))
                .toEqual([{ a: 'its own' }])
            expect(form.reads).toBe(1)
        })

        it('keeps the merge while a row\'s own form holds the same row and names the same fields, in a list of its own', () => {
            // A form `createBatchedForm` did not make gives a list of its fields anew each time.
            const row = countedForm({ items: [{ a: 'typed' }] }, ['items[0].a'])
            const forms = new Map([
                ['row', { form: row, meta: { relativePath: 'items', relativeIndex: 0 } }],
                ['master', { form: countedForm({ items: [{ a: 'as loaded', b: 1 }] }), meta: {} }],
            ])
            const first = getLiveMergedDataKindArray('items', forms)
            expect(getLiveMergedDataKindArray('items', forms)[0]).toBe(first[0])
        })

        it('merges again once a row\'s own form holds another row, though every document holds the same array', () => {
            const row = countedForm({ items: [{ a: 'typed' }] }, ['items[0].a'])
            const forms = new Map([
                ['row', { form: row, meta: { relativePath: 'items', relativeIndex: 0 } }],
                ['master', { form: countedForm({ items: [{ a: 'as loaded' }] }), meta: {} }],
            ])
            getLiveMergedDataKindArray('items', forms)
            row.values = { items: [{ a: 'typed again' }] }
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'typed again' }])
        })

        it('merges again once a row\'s own form has a field it had not, though it holds the same values', () => {
            // A field a `showIf` in the row's cells shows registers with no new values.
            const row = countedForm({ items: [{ a: 'typed', b: 'its own' }] }, ['items[0].a'])
            const forms = new Map([
                ['row', { form: row, meta: { relativePath: 'items', relativeIndex: 0 } }],
                ['master', { form: countedForm({ items: [{ a: 'as loaded', b: 'the document\'s' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'typed', b: 'the document\'s' }])
            row.fields = ['items[0].a', 'items[0].b']
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'typed', b: 'its own' }])
        })

        it('reads the row of a row\'s own form from the values a validator in it was handed', () => {
            const row = countedForm({ items: [undefined, { a: 'before the change' }] }, ['items[1].a'])
            const forms = new Map([
                ['master', { form: countedForm({ items: [{ a: 'first' }, { a: 'as loaded' }] }), meta: {} }],
                ['row', { form: row, meta: { relativePath: 'items', relativeIndex: 1 } }],
            ])
            const handed = { items: [undefined, { a: 'after the change' }] }
            expect(getLiveMergedDataKindArray('items', forms, { form: row, name: 'items[1].a', values: handed }))
                .toEqual([{ a: 'first' }, { a: 'after the change' }])
            // Its state once, for what it started with: a row's form has a field or two.
            expect(row.reads).toBe(1)
        })

        it('merges again once a row\'s own form starts from other values, though it holds the same values', () => {
            // A form that new initial values reset: what it changed is measured from them.
            const values = { items: [{ a: 'typed' }] }
            const row = countedForm(values, ['items[0].a'], { items: [{ a: 'typed' }] })
            const forms = new Map([
                ['row', { form: row, meta: { relativePath: 'items', relativeIndex: 0 } }],
                ['master', { form: countedForm({ items: [{ a: 'as loaded' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'as loaded' }])
            row.initialValues = { items: [{ a: 'as loaded' }] }
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'typed' }])
        })
    })

    describe('a table row\'s own form', () => {
        // A form registered with its row's place as `relativePath` and `relativeIndex`: a row a `useForm` declaration
        // gives a form, which holds its row at that place (`engine/Data.tsx`), as `mergeForms` reads it. It gives the
        // values of the fields it changed, named by that place: with no initial values, every one it holds.
        const rowForm = (values, relativePath, relativeIndex, fields, initialValues) => ({
            form: makeForm(values, fields, initialValues), meta: { relativePath, relativeIndex },
        })

        it('gives the values of the fields it changed, and nothing else: the rest is the document\'s, which another form may have edited', () => {
            // A field in the row's expanded content is the document form's. Until 2026-10-26 the row's form gave its
            // whole row, and the row as it started came back over that field's edit.
            const started = { items: [{ kind: 'a', note: 'old' }, { kind: 'b', note: 'old' }] }
            const forms = new Map([
                ['row', rowForm({ items: [{ kind: 'typed', note: 'old' }] }, 'items', 0, ['items[0].kind', 'items[0].note'], started)],
                ['other row', rowForm(started, 'items', 1, ['items[1].kind', 'items[1].note'], started)],
                ['master', { form: makeForm({ items: [{ kind: 'a', note: 'new' }, { kind: 'b', note: 'new' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ kind: 'typed', note: 'new' }, { kind: 'b', note: 'new' }])
        })

        it('takes away from the document\'s copy the value of a field it no longer holds', () => {
            // A cleared field with `normalize: 'date'` sets `undefined`, which final-form drops. Until 2026-10-26 the
            // document's copy kept the date.
            const forms = new Map([
                ['row', rowForm({ items: [{ kind: 'a' }] }, 'items', 0, ['items[0].kind', 'items[0].when'], { items: [{ kind: 'a', when: '2020-01-01' }] })],
                ['master', { form: makeForm({ items: [{ kind: 'a', when: '2020-01-01', note: 'x' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ kind: 'a', note: 'x' }])
        })

        it('writes its row over the document\'s copy, and keeps the rows after it', () => {
            // Forms register as they mount, children first. Until 2026-10-26 the document's copy won, and the row's form,
            // which holds the array up to its own index, capped the rows there.
            const forms = new Map([
                ['row', rowForm({ items: [{ name: 'edited' }] }, 'items', 0, ['items[0].name'])],
                ['master', { form: makeForm({ items: [{ name: 'as loaded', age: 30 }, { name: 'Bob' }, { name: 'Carol' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ name: 'edited', age: 30 }, { name: 'Bob' }, { name: 'Carol' }])
        })

        it('leaves out a row past the document\'s rows, as one just removed there', () => {
            const forms = new Map([
                ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
                ['removed row', rowForm({ items: [undefined, { name: 'Bob' }] }, 'items', 1, ['items[1].name'])],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ name: 'Alice' }])
        })

        it('reads a row of a table nested in another\'s rows, its path in brackets or in dots', () => {
            const forms = new Map([
                ['master', { form: makeForm({ phases: [{ lines: [{ sku: 'A' }, { sku: 'B' }] }] }), meta: {} }],
                ['row', rowForm({ phases: [{ lines: [undefined, { sku: 'edited' }] }] }, 'phases.0.lines', 1, ['phases.0.lines[1].sku'])],
            ])
            expect(getLiveMergedDataKindArray('phases[0].lines', forms)).toEqual([{ sku: 'A' }, { sku: 'edited' }])
        })

        it('writes a field inside an array inside its row in that row of the array, over the documents\' copies, and caps nothing', () => {
            const forms = new Map([
                ['outer row', rowForm(
                    { phases: [{ title: 'Design', lines: [{ sku: 'A', qty: 1 }, { sku: 'edited' }] }] }, 'phases', 0,
                    ['phases[0].title', 'phases[0].lines[0].sku', 'phases[0].lines[1].sku'],
                )],
                ['master', { form: makeForm({ phases: [{ lines: [{ sku: 'A', qty: 2 }, { sku: 'B' }, { sku: 'C' }] }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('phases.0.lines', forms)).toEqual([{ sku: 'A', qty: 2 }, { sku: 'edited' }, { sku: 'C' }])
        })

        it('takes a field that holds the array as the rows: a row removed from it is gone, and the rows after it moved up', () => {
            // A table registers its array as a field (`FieldArray`).
            const forms = new Map([
                ['outer row', rowForm(
                    { phases: [{ lines: [{ id: 2, sku: 'B' }, null] }] }, 'phases', 0,
                    ['phases[0].lines', 'phases[0].lines[0].sku', 'phases[0].lines[1].sku'],
                )],
                ['master', { form: makeForm({ phases: [{ lines: [{ id: 1, sku: 'A' }, { id: 2, sku: 'B' }, { id: 3, sku: 'C' }] }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('phases.0.lines', forms)).toEqual([{ id: 2, sku: 'B' }, {}])
        })

        it('takes no rows from a field that holds the array where its form holds none: final-form-arrays drops an emptied one', () => {
            const forms = new Map([
                ['outer row', rowForm({ phases: [{ title: 'Design' }] }, 'phases', 0, ['phases[0].lines'], { phases: [{ title: 'Design', lines: [{ sku: 'A' }] }] })],
                ['master', { form: makeForm({ phases: [{ title: 'Design', lines: [{ sku: 'A' }] }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('phases.0.lines', forms)).toEqual([])
        })

        it('writes a row with a form of its own inside another such row after it, whichever registered first', () => {
            const forms = new Map([
                ['line', rowForm({ phases: [{ lines: [undefined, { sku: 'typed' }] }] }, 'phases.0.lines', 1, ['phases.0.lines[1].sku'])],
                ['outer row', rowForm({ phases: [{ lines: [{ sku: 'A' }, { sku: 'B' }] }] }, 'phases', 0, ['phases[0].lines'])],
                ['master', { form: makeForm({ phases: [{ lines: [{ sku: 'A' }, { sku: 'B' }] }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('phases.0.lines', forms)).toEqual([{ sku: 'A' }, { sku: 'typed' }])
        })

        it('takes a field that holds a whole row as the row, makes no row of a value that is none, and leaves out a row past the rows', () => {
            const forms = new Map([
                ['outer row', rowForm(
                    { phases: [{ lines: [{ sku: 'A2' }, 'B', { sku: 'gone' }] }] }, 'phases', 0,
                    ['phases[0].lines[0]', 'phases[0].lines[1]', 'phases[0].lines[2].sku'],
                )],
                ['master', { form: makeForm({ phases: [{ lines: [{ sku: 'A', qty: 1 }, { sku: 'B' }] }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('phases.0.lines', forms)).toEqual([{ sku: 'A2' }, {}])
        })

        it('writes the fields of a row with a form of its own inside a row of this array, as a line of a table in its expanded content', () => {
            // A submit writes only the top arrays back (`submit` in `rules.tsx`). Until 2026-10-27 such a line's edit
            // never reached it.
            const forms = new Map([
                ['master', { form: makeForm({ phases: [{ title: 'Design', lineItems: [{ sku: 'A' }, { sku: 'B' }] }] }), meta: {} }],
                ['line', rowForm(
                    { phases: [{ lineItems: [undefined, { sku: 'X-1' }] }] }, 'phases.0.lineItems', 1, ['phases.0.lineItems[1].sku'],
                    { phases: [{ lineItems: [undefined, { sku: 'B' }] }] },
                )],
            ])
            expect(getLiveMergedDataKindArray('phases', forms)).toEqual([{ title: 'Design', lineItems: [{ sku: 'A' }, { sku: 'X-1' }] }])
        })

        it('takes nothing of a field it shows and leaves alone: another form\'s edit there stays', () => {
            const started = { items: [{ kind: 'a', note: 'old' }] }
            const forms = new Map([
                ['row', rowForm(started, 'items', 0, ['items[0].kind', 'items[0].note'], started)],
                ['master', { form: makeForm({ items: [{ kind: 'a', note: 'new' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ kind: 'a', note: 'new' }])
        })

        it('takes nothing from a row elsewhere, even what it holds at the root of its values', () => {
            const forms = new Map([
                ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
                ['other row', rowForm({ items: [{ name: 'stray' }], others: [{ name: 'edited' }] }, 'others', 0, ['others[0].name'])],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ name: 'Alice' }])
        })

        it('takes nothing from a row whose form has no field there', () => {
            const forms = new Map([
                ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
                ['row', rowForm({ items: [{ name: 'stray' }] }, 'items', 0, ['name'])],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ name: 'Alice' }])
        })

        it('takes nothing from a row whose form names no fields at all', () => {
            const forms = new Map([
                ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
                ['row', { form: { getState: () => ({ values: { items: [{ name: 'stray' }] } }) }, meta: { relativePath: 'items', relativeIndex: 0 } }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ name: 'Alice' }])
        })
    })
})

describe('rowPlaceOf', () => {
    it('places a row by its path and index, and nothing else', () => {
        expect([
            rowPlaceOf({ relativePath: 'dataKind.items', relativeIndex: 1 }),
            rowPlaceOf({ relativePath: 'dataKind.items', relativeIndex: 0 }),
            rowPlaceOf({ relativePath: 'dataKind.items' }),
            rowPlaceOf({ relativeIndex: 1 }),
            rowPlaceOf(undefined),
        ]).toEqual(['dataKind.items[1]', 'dataKind.items[0]', undefined, undefined, undefined])
    })
})

describe('holdsFields', () => {
    // It changed `kind` and cleared `when`, and left `address` as it started.
    const row = makeForm(
        { items: [undefined, { kind: 'a', address: { city: 'X' } }] }, [],
        { items: [undefined, { kind: 'b', when: '2020-01-01', address: { city: 'X' } }] },
    )

    it('is whether a merge holds, at each name inside the row that the row\'s form changed, what the form holds there', () => {
        const merged = { items: [{ kind: 'b' }, { kind: 'a', note: 'its own', address: { city: 'X' } }] }
        expect([
            holdsFields(merged, row, 'items[1]', ['items[1].kind', 'items[1].when']),
            holdsFields({ items: [{}, { kind: 'edited' }] }, row, 'items[1]', ['items[1].kind']),
            holdsFields({ items: [{}, { kind: 'a', when: '2020-01-01' }] }, row, 'items[1]', ['items[1].when']),
        ]).toEqual([true, false, false])
    })

    it('holds for a name the row\'s form did not change, whatever the merge holds there', () => {
        expect(holdsFields({ items: [{}, { address: { city: 'edited elsewhere' } }] }, row, 'items[1]', ['items.1.address'])).toBe(true)
    })

    it('reads no name outside the row, and holds for none', () => {
        expect([
            holdsFields({ items: [{ kind: 'b' }] }, row, 'items[1]', ['items[0].kind', 'kind']),
            holdsFields(undefined, row, 'items[1]', []),
        ]).toEqual([true, true])
    })

    it('reads a form that started with no values as one that started empty', () => {
        const unstarted = { getState: () => ({ values: { items: [undefined, { kind: 'a' }] } }) }
        expect([
            holdsFields({ items: [{}, { kind: 'a' }] }, unstarted, 'items[1]', ['items[1].kind']),
            holdsFields({ items: [{}, { kind: 'b' }] }, unstarted, 'items[1]', ['items[1].kind']),
        ]).toEqual([true, false])
    })

    it('is false for a value where no merge was made, and true for none', () => {
        expect([
            holdsFields(undefined, row, 'items[1]', ['items[1].kind']),
            holdsFields(undefined, row, 'items[1]', ['items[1].when']),
        ]).toEqual([false, true])
    })
})

describe('restartWrittenRows', () => {
    // What a submit does as it writes the merged rows into the document's form (`submit` in `rules.tsx`): what a row's
    // own form changed is measured from what the document's form holds of it afterwards.
    const rowAt = (values, initialValues, fields) => {
        const form = { values, initialValues, getState: () => ({ values: form.values, initialValues: form.initialValues }), getRegisteredFields: () => fields }
        return form
    }
    // The row, and the document's form, which holds the document from its root.
    const formsOf = (row, document) => new Map([
        ['row', { form: row, meta: { relativePath: 'items', relativeIndex: 0 } }],
        ['document', { form: makeForm(document), meta: {} }],
    ])

    it('makes what the document\'s form holds of a row\'s changes its start: a change set back is one more', () => {
        const row = rowAt({ items: [{ kind: 'b' }] }, { items: [{ kind: 'a' }] }, ['items[0].kind'])
        const written = { items: [{ kind: 'b' }] }
        restartWrittenRows(formsOf(row, written))

        row.values = { items: [{ kind: 'a' }] }

        expect(getRawFormsData(formsOf(row, written))).toEqual({ items: [{ kind: 'a' }] })
        // What the merge holds there, the form would not write: its value is its start.
        row.values = { items: [{ kind: 'b' }] }
        expect(holdsFields({ items: [{ kind: 'held elsewhere' }] }, row, 'items[0]', ['items[0].kind'])).toBe(true)
    })

    it('keeps the start of a field whose value the document\'s form does not hold, as of a row a submit did not write', () => {
        const row = rowAt({ items: [{ kind: 'b' }] }, { items: [{ kind: 'a' }] }, ['items[0].kind'])
        const document = { items: [{ kind: 'c' }] }
        restartWrittenRows(formsOf(row, document))

        expect(getRawFormsData(formsOf(row, document))).toEqual({ items: [{ kind: 'b' }] })
        row.values = { items: [{ kind: 'a' }] }
        expect(getRawFormsData(formsOf(row, document))).toEqual({ items: [{ kind: 'c' }] })
    })

    it('makes a value taken away there a start with none', () => {
        const row = rowAt({ items: [{ kind: 'a' }] }, { items: [{ kind: 'a', when: '2020-01-01' }] }, ['items[0].kind', 'items[0].when'])
        restartWrittenRows(formsOf(row, { items: [{ kind: 'a' }] }))

        // Another copy of the document, which holds the date: the form, with none, changed nothing of its start.
        expect(getRawFormsData(formsOf(row, { items: [{ kind: 'a', when: '2020-01-01' }] }))).toEqual({ items: [{ kind: 'a', when: '2020-01-01' }] })
    })

    it('starts a form anew from the new initial values a reset gives it', () => {
        const row = rowAt({ items: [{ kind: 'b' }] }, { items: [{ kind: 'a' }] }, ['items[0].kind'])
        restartWrittenRows(formsOf(row, { items: [{ kind: 'b' }] }))

        // A host's new data: the form starts from them, whatever a submit wrote before.
        row.initialValues = { items: [{ kind: 'c' }] }
        const handedOver = { items: [{ kind: 'c' }] }

        expect(getRawFormsData(formsOf(row, handedOver))).toEqual({ items: [{ kind: 'b' }] })
    })

    it('moves no start where the forms that hold the document from its root do not hold the row\'s values', () => {
        // A Save button in the row's cells submits the row's own document, which writes the merged table into the
        // row's form. Until 2026-10-27 that moved the start of every edited row, and their edits dropped out.
        const row = rowAt({ items: [{ kind: 'b' }, { kind: 'y' }] }, { items: [{ kind: 'a' }] }, ['items[0].kind'])
        const forms = formsOf(row, { items: [{ kind: 'a' }, { kind: 'x' }] })

        restartWrittenRows(forms)

        expect(getRawFormsData(forms)).toEqual({ items: [{ kind: 'b' }, { kind: 'x' }] })
    })

    it('moves no start where no form holds the document from its root', () => {
        const row = rowAt({ items: [{ kind: 'b' }] }, { items: [{ kind: 'a' }] }, ['items[0].kind'])

        restartWrittenRows(new Map([['row', { form: row, meta: { relativePath: 'items', relativeIndex: 0 } }]]))

        expect(getRawFormsData(formsOf(row, { items: [{ kind: 'b' }] }))).toEqual({ items: [{ kind: 'b' }] })
        row.values = { items: [{ kind: 'a' }] }
        expect(getRawFormsData(formsOf(row, { items: [{ kind: 'b' }] }))).toEqual({ items: [{ kind: 'b' }] })
    })

    it('makes the live merge merge again, though every form holds the same values', () => {
        const row = rowAt({ items: [{ a: 'typed' }] }, { items: [{ a: 'as loaded' }] }, ['items[0].a'])
        const forms = formsOf(row, { items: [{ a: 'the document\'s' }] })
        expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'typed' }])

        // Another copy of the document's form, which a submit wrote the row's edit into.
        restartWrittenRows(formsOf(row, { items: [{ a: 'typed' }] }))

        expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'the document\'s' }])
    })
})

describe('more than one form that holds the document from its root', () => {
    // A document's own form holds it from its root, and so does a `useForm` block's that selects no values of its own
    // (`engine/Data.tsx`): each holds a copy of what the other edits, as it started. Until 2026-10-27 the merge took the
    // first to register as the master, the block's, children registering first, and the document's copy came over it.
    const formOf = (values, fields = [], initialValues = {}, meta = {}) => ({ form: makeForm(values, fields, initialValues), meta })
    const start = { title: 'T', items: [{ kind: 'a' }, { kind: 'x' }] }

    describe.each([
        ['getFormsData', getFormsData],
        ['getRawFormsData', getRawFormsData],
    ])('in %s', (_, read) => {
        it('takes a field a block\'s form changed over the copy of the document\'s form, merged over it', () => {
            const forms = new Map([
                ['block', formOf({ ...start, title: 'U' }, ['title'], start)],
                ['document', formOf(start, [], start)],
            ])
            expect(read(forms)).toEqual({ ...start, title: 'U' })
        })

        it('takes a field the document\'s form changed over the copy of a block that registered after it', () => {
            const forms = new Map([
                ['document', formOf({ ...start, title: 'U' }, ['title'], start)],
                ['block', formOf(start, ['items[0].kind'], start)],
            ])
            expect(read(forms)).toEqual({ ...start, title: 'U' })
        })

        it('takes what each changed: a cell of the block\'s table, and the document\'s field', () => {
            const forms = new Map([
                ['block', formOf({ ...start, items: [{ kind: 'b' }, { kind: 'x' }] }, ['items[0].kind', 'items[1].kind', 'items'], start)],
                ['document', formOf({ ...start, title: 'U' }, ['title'], start)],
            ])
            expect(read(forms)).toEqual({ title: 'U', items: [{ kind: 'b' }, { kind: 'x' }] })
        })

        it('gives a field both changed as the merge orders them: the master first, then the others as they came', () => {
            const forms = new Map([
                ['block', formOf({ ...start, title: 'B' }, ['title'], start)],
                ['document', formOf({ ...start, title: 'D' }, ['title'], start)],
            ])
            expect(read(forms).title).toBe('D')
        })

        it('takes away a value a form cleared, and the object it leaves empty, where the other holds it', () => {
            // final-form takes a cleared date away, and the object it leaves empty.
            const dated = { title: 'T', period: { start: '2020-01-01' } }
            const forms = new Map([
                ['block', formOf({ title: 'T' }, ['period.start'], dated)],
                ['document', formOf(dated, [], dated)],
            ])
            expect(read(forms)).toEqual({ title: 'T' })
        })
    })

    it('gives up the value of a Select the document\'s form changed, as that form alone does, over a block\'s copy of it', () => {
        // Its options go first in the order the value picks, and the value goes (`changeOptionOrderForSelectFields`).
        const meta = { view: 'Col', items: [{ view: 'Select', name: 'choice', mapOptions: 'code' }] }
        const loaded = () => ({ choice: '0', options: [{ code: 'A' }, { code: 'B' }] })
        const picked = () => ({ choice: '1', options: [{ code: 'A' }, { code: 'B' }] })
        const alone = getFormsData(new Map([['document', formOf(picked(), ['choice'], loaded(), meta)]]))
        const forms = new Map([
            ['block', formOf(loaded(), [], loaded())],
            ['document', formOf(picked(), ['choice'], loaded(), meta)],
        ])
        expect(alone).toEqual({ options: [{ code: 'B' }, { code: 'A' }] })
        expect(getFormsData(forms)).toEqual(alone)
    })

    describe('in the live merge of an array', () => {
        it('takes a cell a block\'s form changed over the document\'s copy of the row', () => {
            const forms = new Map([
                ['block', formOf({ items: [{ kind: 'b' }, { kind: 'x' }] }, ['items[0].kind'], start)],
                ['document', formOf(start, [], start)],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ kind: 'b' }, { kind: 'x' }])
        })

        it('takes the rows of a table a block\'s form changed, one added among them', () => {
            const forms = new Map([
                ['block', formOf({ items: [{ kind: 'a' }, { kind: 'x' }, { kind: 'new' }] }, ['items', 'items[2].kind'], start)],
                ['document', formOf(start, [], start)],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ kind: 'a' }, { kind: 'x' }, { kind: 'new' }])
        })

        it('merges the rows of a nested document\'s form as before, and reads no field of it', () => {
            // A form with a `relativePath` and no `relativeIndex` holds no document from its root.
            const forms = new Map([
                ['block', formOf({ items: [{ kind: 'b' }, { kind: 'x' }] }, ['items[0].kind'], start)],
                ['nested', formOf({ items: [{ note: 'n' }, { note: 'm' }] }, ['items[0].note'], {}, { relativePath: 'items' })],
                ['document', formOf(start, [], start)],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ kind: 'b', note: 'n' }, { kind: 'x', note: 'm' }])
        })

        it('reads the form a validator runs in from the values it was handed, every field it has there, and not its state', () => {
            const block = { reads: 0, getState () { block.reads += 1; return { values: start, initialValues: start } }, getFieldState: () => ({}), getRegisteredFields: () => ['items[0].kind'] }
            const forms = new Map([['block', { form: block, meta: {} }], ['document', formOf(start, [], start)]])
            const handed = { items: [{ kind: 'b' }, { kind: 'x' }] }
            expect(getLiveMergedDataKindArray('items', forms, { form: block, name: 'items[0].kind', values: handed }))
                .toEqual([{ kind: 'b' }, { kind: 'x' }])
            expect(block.reads).toBe(0)
        })
    })

    describe('a start moved by a submit (restartWrittenRows)', () => {
        const blockAt = (values, fields) => {
            const form = { values, initialValues: start, getState: () => ({ values: form.values, initialValues: form.initialValues }), getRegisteredFields: () => fields }
            return form
        }

        it('is what the other form holds of the block\'s changes after a submit wrote them there: an edit set back is one more', () => {
            const block = blockAt({ items: [{ kind: 'b' }, { kind: 'x' }] }, ['items[0].kind'])
            // The document's form, which the document's submit wrote the block's row into.
            const forms = new Map([['block', { form: block, meta: {} }], ['document', formOf({ items: [{ kind: 'b' }, { kind: 'x' }] })]])

            restartWrittenRows(forms)
            block.values = { items: [{ kind: 'a' }, { kind: 'x' }] }

            expect(getRawFormsData(forms)).toEqual({ items: [{ kind: 'a' }, { kind: 'x' }] })
        })

        it('does not move where the other form does not hold the block\'s changes, as after the block\'s own submit', () => {
            const block = blockAt({ items: [{ kind: 'b' }, { kind: 'x' }] }, ['items[0].kind'])
            const forms = new Map([['block', { form: block, meta: {} }], ['document', formOf(start)]])

            restartWrittenRows(forms)

            expect(getRawFormsData(forms)).toEqual({ title: 'T', items: [{ kind: 'b' }, { kind: 'x' }] })
        })
    })

    it('holdsFields reads every name of such a form, whose place is \'\'', () => {
        const { form } = formOf({ ...start, title: 'U' }, [], start)
        expect([
            holdsFields({ title: 'U' }, form, '', ['title']),
            holdsFields({ title: 'T' }, form, '', ['title']),
            holdsFields({ title: 'T' }, form, '', ['items[0].kind']),
        ]).toEqual([true, false, true])
    })
})

describe('getFormsData', () => {
    it('returns master form values when only one form', () => {
        const forms = new Map([
            ['master', { form: makeForm({ a: 1, b: 2 }), meta: {} }],
        ])
        expect(getFormsData(forms)).toEqual({ a: 1, b: 2 })
    })

    it('skips sub-forms missing relativeIndex', () => {
        const forms = new Map([
            ['master', { form: makeForm({ a: 1 }), meta: {} }],
            ['orphan', { form: makeForm({ b: 2 }, ['b']), meta: { relativePath: 'items' } }],
        ])
        expect(getFormsData(forms)).toEqual({ a: 1 })
    })
})

describe('getRawFormsData', () => {
    it('merges form values without Select reordering', () => {
        const forms = new Map([
            ['master', {
                form: makeForm({
                    optionSelection: '1',
                    options: [{ name: 'A' }, { name: 'B' }],
                }),
                meta: {},
            }],
        ])
        const out = getRawFormsData(forms)
        // Order is preserved (no reorder)
        expect(out.options[0].name).toBe('A')
        expect(out.optionSelection).toBe('1')
    })

})

describe.each([
    ['getFormsData', getFormsData],
    ['getRawFormsData', getRawFormsData],
])('a table row\'s own form, in %s', (_, read) => {
    // A form registered with its row's place as `relativePath` and `relativeIndex`: a table's add row, or a row
    // a `useForm` declaration gives a form. Its fields are named by that place, `items[1].name`, so its values
    // hold the row there, as the engine's do.
    const rowForm = (values, relativePath, relativeIndex, fields, initialValues) => ({
        form: makeForm(values, fields, initialValues), meta: { relativePath, relativeIndex },
    })

    it('takes the values of the fields the row\'s form changed over the document\'s copy, which another form edited', () => {
        // A `useForm` row's form starts from the whole row (`engine/Data.tsx`). Until 2026-10-26 all of it was taken, and
        // the note, which the document's form edited in the row's expanded content, came back as it started.
        const forms = new Map([
            ['row', rowForm(
                { items: [{ kind: 'typed', note: 'old', lines: [{ sku: 'A' }] }] }, 'items', 0, ['items[0].kind', 'items[0].note'],
                { items: [{ kind: 'a', note: 'old', lines: [{ sku: 'A' }] }] },
            )],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', note: 'new', lines: [{ sku: 'A', qty: 2 }] }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'typed', note: 'new', lines: [{ sku: 'A', qty: 2 }] }] })
    })

    it('makes no row of a value the row\'s form no longer holds, where the document has no copy of the row', () => {
        const forms = new Map([
            ['row', rowForm({ items: [undefined, { kind: 'a' }] }, 'items', 1, ['items[1].when'], { items: [undefined, { kind: 'a', when: '2020-01-01' }] })],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'b' }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'b' }] })
    })

    it('takes away from the document\'s copy a value the row\'s form no longer holds', () => {
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'a' }] }, 'items', 0, ['items[0].kind', 'items[0].when'], { items: [{ kind: 'a', when: '2020-01-01' }] })],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', when: '2020-01-01' }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'a' }] })
    })

    it('takes a field named `length` as it takes any other', () => {
        // Until 2026-10-27 a step named `length` was an array's length: the edit never reached the merge.
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'a', length: '5' }] }, 'items', 0, ['items[0].kind', 'items[0].length'])],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', length: '3' }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'a', length: '5' }] })
    })

    it('writes a field into an object of the document\'s copy that another form gave a field of its own', () => {
        // The row started with no `address`; the expanded content added `address.zip`. Until 2026-10-27 the row's
        // `address`, which it did not start with, was written whole, and the zip was gone.
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'a', address: { city: 'X' } }] }, 'items', 0, ['items[0].kind', 'items[0].address.city'])],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', address: { zip: '123' } }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'a', address: { zip: '123', city: 'X' } }] })
    })

    it('takes away only the value a cleared field leaves, and an object it leaves empty, as final-form does, but the row', () => {
        // A cleared `period.start` leaves the row's form no `period`. Until 2026-10-27 the whole `period` was taken away,
        // with the `end` the document's form holds in it.
        const started = { items: [{ kind: 'a', period: { start: '2020-01-01' } }, { period: { start: '2021-01-01' } }] }
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'a' }, {}] }, 'items', 0, ['items[0].kind', 'items[0].period.start'], started)],
            ['other row', rowForm({ items: [{ kind: 'a' }, {}] }, 'items', 1, ['items[1].period.start'], started)],
            ['master', {
                form: makeForm({ title: 'T', items: [{ kind: 'a', period: { start: '2020-01-01', end: '2020-12-31' } }, { period: { start: '2021-01-01' } }] }),
                meta: {},
            }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'a', period: { end: '2020-12-31' } }, {}] })
    })

    it('keeps the value of a field that has gone, as one a `showIf` hides: its form keeps it, as the document\'s keeps its own', () => {
        // The form names every field it has registered (`fieldNamesOf`), the ones that went included.
        const forms = new Map([
            ['row', rowForm(
                { items: [{ kind: 'plain', detail: 'edited' }] }, 'items', 0, ['items[0].kind', 'items[0].detail'],
                { items: [{ kind: 'other', detail: 'as loaded' }] },
            )],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'other', detail: 'as loaded' }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'plain', detail: 'edited' }] })
    })

    it('takes nothing of a field the row\'s form shows and leaves alone: an edit of another form there stays', () => {
        // A field of the row's expanded content, of the same name as one its cells show. Until 2026-10-27 the value the
        // row's form started with was written over the edit.
        const started = { items: [{ kind: 'a', note: 'old' }] }
        const forms = new Map([
            ['row', rowForm(started, 'items', 0, ['items[0].kind', 'items[0].note'], started)],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', note: 'new' }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'a', note: 'new' }] })
    })

    it('leaves out a field the document\'s copy has no room for', () => {
        // final-form throws for an index into an object, and for a key of an array.
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'typed', lines: [{ sku: 'X' }] }] }, 'items', 0, ['items[0].kind', 'items[0].lines[0].sku'])],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', lines: { first: { sku: 'A' } } }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'typed', lines: { first: { sku: 'A' } } }] })
    })

    it('places the row its fields hold at that row, and only once', () => {
        const forms = new Map([
            ['master', { form: makeForm({ items: [{}, {}] }), meta: {} }],
            ['row', rowForm({ items: [undefined, { name: 'Alice' }] }, 'items', 1, ['items[1].name'])],
        ])
        expect(read(forms)).toEqual({ items: [{}, { name: 'Alice' }] })
    })

    it('takes nothing else of the form: what it started from, at the root of its values, is not read', () => {
        const forms = new Map([
            ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
            ['row', rowForm({ name: 'as it started', items: [{ name: 'Bob' }] }, 'items', 0, ['items[0].name'])],
        ])
        expect(read(forms)).toEqual({ items: [{ name: 'Bob' }] })
    })

    it('takes nothing from a form that holds nothing at its row yet', () => {
        const forms = new Map([
            ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
            ['add row', rowForm({}, 'items', 1, ['items[1].name'])],
        ])
        expect(read(forms)).toEqual({ items: [{ name: 'Alice' }] })
    })

    it('writes the row over the document\'s copy of it, though the row\'s form registered first', () => {
        // Forms register as they mount, children first; a document with one key at its root has no master.
        const forms = new Map([
            ['row', rowForm({ items: [{ name: 'edited' }] }, 'items', 0, ['items[0].name'])],
            ['master', { form: makeForm({ items: [{ name: 'as loaded', age: 30 }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ items: [{ name: 'edited', age: 30 }] })
    })

    it('puts the row of a table nested in a row into the document\'s own arrays', () => {
        const forms = new Map([
            ['nested row', rowForm({ phases: [{ lines: [undefined, { sku: 'B' }] }] }, 'phases.0.lines', 1, ['phases.0.lines[1].sku'])],
            ['master', { form: makeForm({ title: 'T', phases: [{ lines: [{ sku: 'A' }] }, { lines: [] }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', phases: [{ lines: [{ sku: 'A' }, { sku: 'B' }] }, { lines: [] }] })
    })

    it('places the row in a document of its own when no form holds the document from its root', () => {
        const forms = new Map([['row', rowForm({ items: [undefined, { name: 'Alice' }] }, 'items', 1, ['items[1].name'])]])
        expect(read(forms)).toEqual({ items: [undefined, { name: 'Alice' }] })
    })

    it('writes a field that holds an array whole, then the fields of the rows of that array with forms of their own', () => {
        // A table registers its array as a field (`FieldArray`): a line removed from it is gone, and the lines after it
        // moved up. A line's own form writes after the row's, whichever registered first.
        const forms = new Map([
            ['line', rowForm({ items: [{ lines: [{ sku: 'typed' }] }] }, 'items.0.lines', 0, ['items.0.lines[0].sku'])],
            ['row', rowForm({ items: [{ kind: 'a', lines: [{ id: 2, sku: 'B' }] }] }, 'items', 0, ['items[0].kind', 'items[0].lines', 'items[0].lines[1].sku'])],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', lines: [{ id: 1, sku: 'A' }, { id: 2, sku: 'B' }] }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'a', lines: [{ id: 2, sku: 'typed' }] }] })
    })
})

describe('changeOptionOrderForSelectFields', () => {
    it('reorders data for index-based Select', () => {
        const data = {
            optionSelection: '1',
            options: [
                { optionName: 'Option A' },
                { optionName: 'Option B' },
                { optionName: 'Option C' },
            ],
        }
        const meta = {
            view: 'Select',
            name: 'optionSelection',
            mapOptions: { text: 'optionName', value: '{index}' },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        expect(result.options[0].optionName).toBe('Option B')
        expect(result.optionSelection).toBeUndefined()
    })

    it('does NOT reorder for non-index Select (stable value)', () => {
        const data = {
            optionSelection: 'Option B',
            options: [
                { optionName: 'Option A' },
                { optionName: 'Option B' },
                { optionName: 'Option C' },
            ],
        }
        const meta = {
            view: 'Select',
            name: 'optionSelection',
            mapOptions: { text: 'optionName', value: 'optionName' },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        expect(result.options[0].optionName).toBe('Option A')
        expect(result.optionSelection).toBe('Option B')
    })

    it('processes nested items recursively', () => {
        const data = {
            categorySelection: '1',
            categories: [
                { categoryName: 'Basic' },
                { categoryName: 'Standard' },
            ],
        }
        const meta = {
            view: 'VerticalLayout',
            items: [
                {
                    view: 'Select',
                    name: 'categorySelection',
                    mapOptions: { text: 'categoryName', value: '{index}' },
                },
            ],
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        expect(result.categories[0].categoryName).toBe('Standard')
        expect(result.categorySelection).toBeUndefined()
    })

    it('processes renderItem.items recursively', () => {
        const data = {
            selection: '0',
            items: [
                { name: 'A' },
                { name: 'B' },
            ],
        }
        const meta = {
            view: 'Table',
            renderItem: {
                items: [
                    {
                        view: 'Select',
                        name: 'selection',
                        mapOptions: { text: 'name', value: '{index}' },
                    },
                ],
            },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        // selection '0' means first item, moving it to front is a no-op
        expect(result.items[0].name).toBe('A')
    })

    it('returns data unchanged when meta is null', () => {
        const data = { foo: 'bar' }
        const result = changeOptionOrderForSelectFields(data, null)
        expect(result).toEqual({ foo: 'bar' })
    })

    it('handles non-string select value (number)', () => {
        const data = {
            optionSelection: 1,
            options: [{ optionName: 'A' }, { optionName: 'B' }],
        }
        const meta = {
            view: 'Select',
            name: 'optionSelection',
            mapOptions: { text: 'optionName', value: '{index}' },
        }
        const result = changeOptionOrderForSelectFields(data, meta)
        // non-string value should not trigger reorder
        expect(result.options[0].optionName).toBe('A')
        expect(result.optionSelection).toBe(1)
    })
})
