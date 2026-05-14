import { performStorage } from '../storage'
import { ADD, DELETE, GET, SET } from '../constants'

describe('performStorage', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('SET serializes the value to JSON', () => {
        performStorage(SET, 'k', { a: 1 })
        expect(localStorage.getItem('k')).toBe('{"a":1}')
    })

    it('GET deserializes JSON values', () => {
        localStorage.setItem('k', '{"a":1}')
        expect(performStorage(GET, 'k')).toEqual({ a: 1 })
    })

    it('GET returns null when key is absent', () => {
        expect(performStorage(GET, 'missing')).toBeNull()
    })

    it('DELETE removes the key', () => {
        localStorage.setItem('k', '"x"')
        performStorage(DELETE, 'k')
        expect(localStorage.getItem('k')).toBeNull()
    })

    it('ADD appends to an existing list', () => {
        localStorage.setItem('items', '[1,2]')
        performStorage(ADD, 'items', 3)
        expect(JSON.parse(localStorage.getItem('items'))).toEqual([1, 2, 3])
    })

    it('ADD seeds with the initial value when no data is stored', () => {
        performStorage(ADD, 'items', 1, [])
        expect(JSON.parse(localStorage.getItem('items'))).toEqual([1])
    })

    it('ADD merges into an existing object via update()', () => {
        localStorage.setItem('user', '{"name":"A"}')
        performStorage(ADD, 'user', { sign: 's' }, {})
        expect(JSON.parse(localStorage.getItem('user'))).toEqual({ name: 'A', sign: 's' })
    })
})
