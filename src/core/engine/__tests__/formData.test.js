import {
    changeOptionOrderForSelectFields,
    getFormsData,
    getRawFormsData,
    getLiveMergedDataKindArray,
    holdsFields,
    rowPlaceOf,
} from '../formData'

/** A form as the merge reads it: its values, and the fields it registers, which a table row's own form gives. */
function makeForm(values, fields = []) {
    return {
        getState: () => ({ values }),
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
        function countedForm (values, fields = []) {
            const form = {
                reads: 0,
                values,
                fields,
                getState () {
                    form.reads += 1
                    return { values: form.values }
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
            expect(row.reads).toBe(0)
        })
    })

    describe('a table row\'s own form', () => {
        // A form registered with its row's place as `relativePath` and `relativeIndex`: a row a `useForm` declaration
        // gives a form, which holds its row at that place (`engine/Data.tsx`), as `mergeForms` reads it. It gives the
        // values of its fields, named by that place.
        const rowForm = (values, relativePath, relativeIndex, fields) => ({
            form: makeForm(values, fields), meta: { relativePath, relativeIndex },
        })

        it('gives the values of its fields, and nothing else: the rest is the document\'s, which another form may have edited', () => {
            // A field in the row's expanded content is the document form's. Until 2026-10-26 the row's form gave its
            // whole row, and the row as it started came back over that field's edit.
            const started = { items: [{ kind: 'a', note: 'old' }, { kind: 'b', note: 'old' }] }
            const forms = new Map([
                ['row', rowForm({ items: [{ kind: 'typed', note: 'old' }] }, 'items', 0, ['items[0].kind'])],
                ['other row', rowForm(started, 'items', 1, ['items[1].kind'])],
                ['master', { form: makeForm({ items: [{ kind: 'a', note: 'new' }, { kind: 'b', note: 'new' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ kind: 'typed', note: 'new' }, { kind: 'b', note: 'new' }])
        })

        it('takes away from the document\'s copy the value of a field it no longer holds', () => {
            // A cleared field with `normalize: 'date'` sets `undefined`, which final-form drops. Until 2026-10-26 the
            // document's copy kept the date.
            const forms = new Map([
                ['row', rowForm({ items: [{ kind: 'a' }] }, 'items', 0, ['items[0].kind', 'items[0].when'])],
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
                ['outer row', rowForm({ phases: [{ title: 'Design' }] }, 'phases', 0, ['phases[0].lines'])],
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
    const row = makeForm({ items: [undefined, { kind: 'a', address: { city: 'X' } }] })

    it('is whether a merge holds, at each name inside the row, what the row\'s form holds there', () => {
        const merged = { items: [{ kind: 'b' }, { kind: 'a', note: 'its own', address: { city: 'X' } }] }
        expect([
            holdsFields(merged, row, 'items[1]', ['items[1].kind', 'items.1.address']),
            holdsFields({ items: [{}, { kind: 'edited' }] }, row, 'items[1]', ['items[1].kind']),
            holdsFields({ items: [{}, { kind: 'a', when: '2020-01-01' }] }, row, 'items[1]', ['items[1].when']),
        ]).toEqual([true, false, false])
    })

    it('reads no name outside the row, and holds for none', () => {
        expect([
            holdsFields({ items: [{ kind: 'b' }] }, row, 'items[1]', ['items[0].kind', 'kind']),
            holdsFields(undefined, row, 'items[1]', []),
        ]).toEqual([true, true])
    })

    it('is false for a value where no merge was made, and true for none', () => {
        expect([
            holdsFields(undefined, row, 'items[1]', ['items[1].kind']),
            holdsFields(undefined, row, 'items[1]', ['items[1].when']),
        ]).toEqual([false, true])
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
    const rowForm = (values, relativePath, relativeIndex, fields) => ({
        form: makeForm(values, fields), meta: { relativePath, relativeIndex },
    })

    it('takes the values of the row\'s fields over the document\'s copy, which another form edited', () => {
        // A `useForm` row's form starts from the whole row (`engine/Data.tsx`). Until 2026-10-26 all of it was taken, and
        // the note, which the document's form edited in the row's expanded content, came back as it started.
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'typed', note: 'old', lines: [{ sku: 'A' }] }] }, 'items', 0, ['items[0].kind'])],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', note: 'new', lines: [{ sku: 'A', qty: 2 }] }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'typed', note: 'new', lines: [{ sku: 'A', qty: 2 }] }] })
    })

    it('makes no row of a value the row\'s form does not hold, where the document has no copy of the row', () => {
        const forms = new Map([
            ['row', rowForm({ items: [undefined, { kind: 'a' }] }, 'items', 1, ['items[1].when'])],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'b' }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'b' }] })
    })

    it('takes away from the document\'s copy a value the row\'s form no longer holds', () => {
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'a' }] }, 'items', 0, ['items[0].kind', 'items[0].when'])],
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
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'a' }, {}] }, 'items', 0, ['items[0].kind', 'items[0].period.start'])],
            ['other row', rowForm({ items: [{ kind: 'a' }, {}] }, 'items', 1, ['items[1].period.start'])],
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
            ['row', rowForm({ items: [{ kind: 'plain', detail: 'edited' }] }, 'items', 0, ['items[0].kind', 'items[0].detail'])],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'other', detail: 'as loaded' }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'plain', detail: 'edited' }] })
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
