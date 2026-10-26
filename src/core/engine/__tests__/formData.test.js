import {
    changeOptionOrderForSelectFields,
    changesOf,
    getFormsData,
    getRawFormsData,
    getLiveMergedDataKindArray,
    rowPlaceOf,
} from '../formData'

function makeForm(values, initialValues) {
    return {
        getState: () => ({ values, initialValues }),
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
                getState () {
                    form.reads += 1
                    return { values: form.values }
                },
                getFieldState: name => fields.indexOf(name) === -1 ? undefined : { name },
                getRegisteredFields: () => fields.slice(),
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

        it('merges again once a row\'s own form holds another row, though every document holds the same array', () => {
            const row = countedForm({ items: [{ a: 'typed' }] })
            const forms = new Map([
                ['row', { form: row, meta: { relativePath: 'items', relativeIndex: 0 } }],
                ['master', { form: countedForm({ items: [{ a: 'as loaded' }] }), meta: {} }],
            ])
            getLiveMergedDataKindArray('items', forms)
            row.values = { items: [{ a: 'typed again' }] }
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'typed again' }])
        })

        it('merges again once a row\'s own form starts from another row, though it holds the same values', () => {
            const values = { items: [{ a: 'typed' }] }
            const row = { values, initialValues: { items: [{ a: 'typed' }] }, getState: () => ({ values, initialValues: row.initialValues }) }
            const forms = new Map([
                ['row', { form: row, meta: { relativePath: 'items', relativeIndex: 0 } }],
                ['master', { form: countedForm({ items: [{ a: 'as loaded' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'as loaded' }])
            row.initialValues = { items: [{ a: 'as loaded' }] }
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ a: 'typed' }])
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
            // Its state once, for what it started from: a row's form has a field or two.
            expect(row.reads).toBe(1)
        })
    })

    describe('a table row\'s own form', () => {
        // A form registered with its row's place as `relativePath` and `relativeIndex`: a row a `useForm` declaration
        // gives a form, which holds its row at that place and nothing else (`engine/Data.tsx`), as `mergeForms` reads it.
        // It gives what it changed of what it started from: with no initial values, all it holds.
        const rowForm = (values, relativePath, relativeIndex, initialValues) => ({
            form: makeForm(values, initialValues), meta: { relativePath, relativeIndex },
        })

        it('gives only what it changed of its row: the rest is the document\'s, which another form may have edited', () => {
            // A field in the row's expanded content is the document form's. Until 2026-10-26 the row's form gave its
            // whole row, and the row as it started came back over that field's edit.
            const started = { items: [{ kind: 'a', note: 'old' }, { kind: 'b', note: 'old' }] }
            const forms = new Map([
                ['row', rowForm({ items: [{ kind: 'typed', note: 'old' }] }, 'items', 0, started)],
                ['other row', rowForm(started, 'items', 1, started)],
                ['master', { form: makeForm({ items: [{ kind: 'a', note: 'new' }, { kind: 'b', note: 'new' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ kind: 'typed', note: 'new' }, { kind: 'b', note: 'new' }])
        })

        it('drops from the document\'s copy a value its row no longer holds, and cuts an array it made shorter', () => {
            // A cleared field with `normalize: 'date'` sets `undefined`, which final-form drops. Until 2026-10-26 the
            // document's copy kept the date.
            const started = { items: [{ kind: 'a', when: '2020-01-01', lines: [{ sku: 'A' }, { sku: 'B' }] }] }
            const forms = new Map([
                ['row', rowForm({ items: [{ kind: 'a', lines: [{ sku: 'A' }] }] }, 'items', 0, started)],
                ['master', { form: makeForm({ items: [{ kind: 'a', when: '2020-01-01', note: 'x', lines: [{ sku: 'A' }, { sku: 'B' }] }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ kind: 'a', note: 'x', lines: [{ sku: 'A' }] }])
        })

        it('writes its row over the document\'s copy, and keeps the rows after it', () => {
            // Forms register as they mount, children first. Until 2026-10-26 the document's copy won, and the row's form,
            // which holds the array up to its own index, capped the rows there.
            const forms = new Map([
                ['row', rowForm({ items: [{ name: 'edited' }] }, 'items', 0)],
                ['master', { form: makeForm({ items: [{ name: 'as loaded', age: 30 }, { name: 'Bob' }, { name: 'Carol' }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ name: 'edited', age: 30 }, { name: 'Bob' }, { name: 'Carol' }])
        })

        it('leaves out a row past the document\'s rows, as one just removed there', () => {
            const forms = new Map([
                ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
                ['removed row', rowForm({ items: [undefined, { name: 'Bob' }] }, 'items', 1)],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ name: 'Alice' }])
        })

        it('reads a row of a table nested in another\'s rows, its path in brackets or in dots', () => {
            const forms = new Map([
                ['master', { form: makeForm({ phases: [{ lines: [{ sku: 'A' }, { sku: 'B' }] }] }), meta: {} }],
                ['row', rowForm({ phases: [{ lines: [undefined, { sku: 'edited' }] }] }, 'phases.0.lines', 1)],
            ])
            expect(getLiveMergedDataKindArray('phases[0].lines', forms)).toEqual([{ sku: 'A' }, { sku: 'edited' }])
        })

        it('gives what it changed of an array inside its row, row by row, over the documents\' copies, and caps nothing', () => {
            const started = { phases: [{ lines: [{ sku: 'A', qty: 1 }, { sku: 'B' }] }] }
            const forms = new Map([
                ['outer row', rowForm({ phases: [{ lines: [{ sku: 'A', qty: 1 }, { sku: 'edited' }] }] }, 'phases', 0, started)],
                ['master', { form: makeForm({ phases: [{ lines: [{ sku: 'A', qty: 2 }, { sku: 'B' }, { sku: 'C' }] }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('phases.0.lines', forms)).toEqual([{ sku: 'A', qty: 2 }, { sku: 'edited' }, { sku: 'C' }])
        })

        it('cuts the rows of an array inside its row that it made shorter, and none it did not', () => {
            const started = { phases: [{ lines: [{ sku: 'A' }, { sku: 'B' }, { sku: 'C' }] }] }
            const shortened = rowForm({ phases: [{ lines: [{ sku: 'A' }, { sku: 'B' }] }] }, 'phases', 0, started)
            const read = documentLines => getLiveMergedDataKindArray('phases.0.lines', new Map([
                ['outer row', shortened],
                ['master', { form: makeForm({ phases: [{ lines: documentLines }] }), meta: {} }],
            ]))
            expect([read([{ sku: 'A' }, { sku: 'B' }, { sku: 'C' }]), read([{ sku: 'A' }])])
                .toEqual([[{ sku: 'A' }, { sku: 'B' }], [{ sku: 'A' }]])
        })

        it('takes nothing of an array inside its row that it had no start for', () => {
            const forms = new Map([
                ['outer row', rowForm({ phases: [{ lines: [{ sku: 'edited' }] }] }, 'phases', 0)],
                ['master', { form: makeForm({ phases: [{ lines: [{ sku: 'A' }] }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('phases.0.lines', forms)).toEqual([{ sku: 'A' }])
        })

        it('leaves out what it changed of an array inside its row past the documents\' rows, and what is no row', () => {
            const started = { phases: [{ lines: [{ sku: 'A' }, 'B', { sku: 'C' }] }] }
            const forms = new Map([
                ['outer row', rowForm({ phases: [{ lines: [{ sku: 'A' }, 'edited', { sku: 'gone' }] }] }, 'phases', 0, started)],
                ['master', { form: makeForm({ phases: [{ lines: [{ sku: 'A' }, { sku: 'B' }] }] }), meta: {} }],
            ])
            expect(getLiveMergedDataKindArray('phases.0.lines', forms)).toEqual([{ sku: 'A' }, { sku: 'B' }])
        })

        it('takes nothing from a row elsewhere, even what it holds at the root of its values', () => {
            const forms = new Map([
                ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
                ['other row', rowForm({ items: [{ name: 'stray' }], others: [{ name: 'edited' }] }, 'others', 0)],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ name: 'Alice' }])
        })

        it('takes nothing from a row that holds no row there', () => {
            const forms = new Map([
                ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
                ['row', rowForm({ items: [null] }, 'items', 0)],
            ])
            expect(getLiveMergedDataKindArray('items', forms)).toEqual([{ name: 'Alice' }])
        })
    })
})

describe('changesOf', () => {
    it('is each change at its path, in objects and arrays', () => {
        const initial = { kind: 'a', note: 'old', address: { city: 'X', zip: '1' }, lines: [{ sku: 'A' }, { sku: 'B' }] }
        const current = { kind: 'a', note: 'new', address: { city: 'X', zip: '2' }, lines: [{ sku: 'A' }, { sku: 'C' }] }

        expect(changesOf(initial, current)).toEqual([
            { path: ['note'], value: 'new' },
            { path: ['address', 'zip'], value: '2' },
            { path: ['lines', 1, 'sku'], value: 'C' },
        ])
    })

    it('is a value the current values no longer hold, and an array they made shorter', () => {
        // final-form drops a value set to `undefined`, as a cleared field with `normalize: 'date'` sets it.
        expect([
            changesOf({ a: 1, when: '2020-01-01', none: undefined }, { a: 1 }),
            changesOf({ when: '2020-01-01' }, { when: undefined }),
            changesOf({ lines: [{ sku: 'A' }, { sku: 'B' }, { sku: 'C' }] }, { lines: [{ sku: 'A' }] }),
        ]).toEqual([
            [{ path: ['when'], removed: true }],
            [{ path: ['when'], removed: true }],
            [{ path: ['lines', 'length'], value: 1 }],
        ])
    })

    it('is nothing for what stayed, nor for a row the current values do not hold at all', () => {
        const same = { a: { b: 1 } }
        expect([
            changesOf(same, same),
            changesOf({ a: 1, b: [1] }, { a: 1, b: [1] }),
            changesOf({ a: 1 }, undefined),
        ]).toEqual([[], [], []])
    })

    it('compares other objects by value', () => {
        expect([
            changesOf({ at: new Date(0) }, { at: new Date(0) }),
            changesOf({ at: new Date(0) }, { at: new Date(1) }),
        ]).toEqual([[], [{ path: ['at'], value: new Date(1) }]])
    })

    it('is the value that took the place of another kind of value, or of none', () => {
        expect([
            changesOf(undefined, { a: 1 }),
            changesOf(null, { a: 1 }),
            changesOf({ a: 1 }, null),
            changesOf({ a: [1] }, { a: 'x' }),
        ]).toEqual([
            [{ path: [], value: { a: 1 } }],
            [{ path: [], value: { a: 1 } }],
            [{ path: [], value: null }],
            [{ path: ['a'], value: 'x' }],
        ])
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
            ['orphan', { form: makeForm({ b: 2 }), meta: { relativePath: 'items' } }],
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
    const rowForm = (values, relativePath, relativeIndex, initialValues) => ({
        form: makeForm(values, initialValues), meta: { relativePath, relativeIndex },
    })

    it('takes what the row\'s form changed of the row, over the document\'s copy another form edited', () => {
        // A `useForm` row's form starts from the whole row (`engine/Data.tsx`). Until 2026-10-26 all of it was taken, and
        // the note, which the document's form edited in the row's expanded content, came back as it started.
        const started = { items: [{ kind: 'a', note: 'old', lines: [{ sku: 'A' }] }] }
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'typed', note: 'old', lines: [{ sku: 'A' }] }] }, 'items', 0, started)],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', note: 'new', lines: [{ sku: 'A', qty: 2 }] }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'typed', note: 'new', lines: [{ sku: 'A', qty: 2 }] }] })
    })

    it('makes no row of a value the row\'s form no longer holds, where the document has no copy of the row', () => {
        const forms = new Map([
            ['row', rowForm({ items: [undefined, { kind: 'a' }] }, 'items', 1, { items: [undefined, { kind: 'a', when: '2020-01-01' }] })],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'b' }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'b' }] })
    })

    it('drops from the document\'s copy a value the row\'s form no longer holds', () => {
        const started = { items: [{ kind: 'a', when: '2020-01-01' }] }
        const forms = new Map([
            ['row', rowForm({ items: [{ kind: 'a' }] }, 'items', 0, started)],
            ['master', { form: makeForm({ title: 'T', items: [{ kind: 'a', when: '2020-01-01' }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', items: [{ kind: 'a' }] })
    })

    it('places the row its fields hold at that row, and only once', () => {
        const forms = new Map([
            ['master', { form: makeForm({ items: [{}, {}] }), meta: {} }],
            ['row', rowForm({ items: [undefined, { name: 'Alice' }] }, 'items', 1)],
        ])
        expect(read(forms)).toEqual({ items: [{}, { name: 'Alice' }] })
    })

    it('takes nothing else of the form: what it started from, at the root of its values, is not read', () => {
        const forms = new Map([
            ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
            ['row', rowForm({ name: 'as it started', items: [{ name: 'Bob' }] }, 'items', 0)],
        ])
        expect(read(forms)).toEqual({ items: [{ name: 'Bob' }] })
    })

    it('takes nothing from a form that holds nothing at its row yet', () => {
        const forms = new Map([
            ['master', { form: makeForm({ items: [{ name: 'Alice' }] }), meta: {} }],
            ['add row', rowForm({}, 'items', 1)],
        ])
        expect(read(forms)).toEqual({ items: [{ name: 'Alice' }] })
    })

    it('writes the row over the document\'s copy of it, though the row\'s form registered first', () => {
        // Forms register as they mount, children first; a document with one key at its root has no master.
        const forms = new Map([
            ['row', rowForm({ items: [{ name: 'edited' }] }, 'items', 0)],
            ['master', { form: makeForm({ items: [{ name: 'as loaded', age: 30 }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ items: [{ name: 'edited', age: 30 }] })
    })

    it('puts the row of a table nested in a row into the document\'s own arrays', () => {
        const forms = new Map([
            ['nested row', rowForm({ phases: [{ lines: [undefined, { sku: 'B' }] }] }, 'phases.0.lines', 1)],
            ['master', { form: makeForm({ title: 'T', phases: [{ lines: [{ sku: 'A' }] }, { lines: [] }] }), meta: {} }],
        ])
        expect(read(forms)).toEqual({ title: 'T', phases: [{ lines: [{ sku: 'A' }, { sku: 'B' }] }, { lines: [] }] })
    })

    it('places the row in a document of its own when no form holds the document from its root', () => {
        const forms = new Map([['row', rowForm({ items: [undefined, { name: 'Alice' }] }, 'items', 1)]])
        expect(read(forms)).toEqual({ items: [undefined, { name: 'Alice' }] })
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
