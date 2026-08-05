import { ADD, DELETE, GET, SET } from '../constants'

const localStorageDescriptor = Object.getOwnPropertyDescriptor(global, 'localStorage')

function restoreLocalStorage () {
    if (localStorageDescriptor) {
        Object.defineProperty(global, 'localStorage', localStorageDescriptor)
    }
}

function loadClientStorage () {
    restoreLocalStorage()
    jest.resetModules()
    return require('../storage').performStorage
}

function loadBackendStorage (backend) {
    delete global.localStorage
    jest.resetModules()
    const { Active } = require('../_envs')
    Active.Storage = backend
    return require('../storage').performStorage
}

describe('performStorage data-integrity contract', () => {
    beforeEach(() => {
        restoreLocalStorage()
        localStorage.clear()
    })

    afterEach(() => {
        restoreLocalStorage()
        localStorage.clear()
        jest.resetModules()
    })

    it.each([
        ['object', { nested: { count: 1 } }, '{"nested":{"count":1}}'],
        ['array', [0, false, ''], '[0,false,""]'],
        ['zero', 0, '0'],
        ['false', false, 'false'],
        ['empty string', '', ''],
        ['null', null, 'null'],
    ])('round-trips a serialized %s value', (label, value, serialized) => {
        const performStorage = loadClientStorage()

        performStorage(SET, 'value', value)

        expect(localStorage.getItem('value')).toBe(serialized)
        expect(performStorage(GET, 'value')).toEqual(value)
    })

    it('appends falsey values to a stored list without dropping them', () => {
        const performStorage = loadClientStorage()
        performStorage(SET, 'items', [])

        performStorage(ADD, 'items', 0)
        performStorage(ADD, 'items', false)
        performStorage(ADD, 'items', '')
        performStorage(ADD, 'items', null)

        expect(performStorage(GET, 'items')).toEqual([0, false, '', null])
    })

    it('merges an object into stored data while retaining nested fields', () => {
        const performStorage = loadClientStorage()
        performStorage(SET, 'settings', {
            enabled: true,
            nested: { keep: 'yes' },
        })

        performStorage(ADD, 'settings', {
            enabled: false,
            nested: { count: 0 },
        }, {})

        expect(performStorage(GET, 'settings')).toEqual({
            enabled: false,
            nested: { keep: 'yes', count: 0 },
        })
    })

    it('rejects an unsupported action without touching storage', () => {
        const performStorage = loadClientStorage()

        expect(() => performStorage('UPSERT', 'value', 1)).toThrow(TypeError)
        expect(localStorage.length).toBe(0)
    })

    it('initializes an async backend and performs ADD with raw values', async () => {
        const backend = {
            init: jest.fn().mockResolvedValue('ready'),
            getItem: jest.fn().mockResolvedValue([1]),
            setItem: jest.fn().mockResolvedValue('saved'),
        }
        const performStorage = loadBackendStorage(backend)

        await expect(performStorage.init('/cache', { ttl: 20 })).resolves.toBe('ready')
        await expect(performStorage(ADD, 'items', 0)).resolves.toBe('saved')

        expect(backend.init).toHaveBeenCalledWith('/cache', { ttl: 20 })
        expect(backend.getItem).toHaveBeenCalledWith('items', null)
        expect(backend.setItem).toHaveBeenCalledWith('items', [1, 0])
    })

    it('uses the supplied initial object when async storage has no value', async () => {
        const backend = {
            init: jest.fn().mockResolvedValue('ready'),
            getItem: jest.fn().mockResolvedValue(null),
            setItem: jest.fn().mockResolvedValue('saved'),
        }
        const performStorage = loadBackendStorage(backend)
        await performStorage.init('options')

        await expect(performStorage(ADD, 'settings', {
            enabled: false,
            retries: 0,
        }, { retained: true })).resolves.toBe('saved')

        expect(backend.setItem).toHaveBeenCalledWith('settings', {
            retained: true,
            enabled: false,
            retries: 0,
        })
    })

    it('routes synchronously after initSync and forwards adapter arguments unchanged', async () => {
        const storedSettings = { nested: { keep: true } }
        const backend = {
            init: jest.fn().mockResolvedValue('async-ready'),
            initSync: jest.fn().mockReturnValue('sync-ready'),
            getItem: jest.fn(),
            setItem: jest.fn(),
            getItemSync: jest.fn().mockReturnValue(storedSettings),
            setItemSync: jest.fn().mockReturnValue('saved-sync'),
            removeItemSync: jest.fn().mockReturnValue(true),
        }
        const performStorage = loadBackendStorage(backend)

        await performStorage.init('async-options')
        expect(performStorage.initSync('/cache-sync', { ttl: 30 })).toBe('sync-ready')
        expect(performStorage.isAsync).toBe(false)

        expect(performStorage(ADD, 'settings', {
            nested: { count: 0 },
            enabled: false,
        }, {})).toBe('saved-sync')
        expect(performStorage(DELETE, 'obsolete')).toBe(true)

        expect(backend.initSync).toHaveBeenCalledWith('/cache-sync', { ttl: 30 })
        expect(backend.getItemSync).toHaveBeenCalledWith('settings', null)
        expect(backend.setItemSync).toHaveBeenCalledWith('settings', {
            nested: { keep: true, count: 0 },
            enabled: false,
        })
        expect(backend.removeItemSync).toHaveBeenCalledWith('obsolete', null)
        expect(backend.getItem).not.toHaveBeenCalled()
        expect(backend.setItem).not.toHaveBeenCalled()
    })

    it('restores asynchronous routing when init follows initSync', async () => {
        const backend = {
            init: jest.fn().mockResolvedValue('async-ready'),
            initSync: jest.fn().mockReturnValue('sync-ready'),
            getItem: jest.fn().mockResolvedValue({ source: 'async' }),
            getItemSync: jest.fn().mockReturnValue({ source: 'sync' }),
        }
        const performStorage = loadBackendStorage(backend)

        performStorage.initSync('sync-options')
        await performStorage.init('async-options')

        await expect(performStorage(GET, 'value')).resolves.toEqual({ source: 'async' })
        expect(backend.getItem).toHaveBeenCalledWith('value', null)
        expect(backend.getItemSync).not.toHaveBeenCalled()
    })
})
