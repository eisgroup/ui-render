/** @jest-environment node */

const GLOBAL_NAMES = ['window', 'location', 'localStorage', 'WebSocket']
const originalDescriptors = Object.fromEntries(
    GLOBAL_NAMES.map(name => [name, Object.getOwnPropertyDescriptor(global, name)]),
)
const originalNodeEnv = process.env.NODE_ENV

function setGlobal (name, value) {
    Object.defineProperty(global, name, {
        configurable: true,
        writable: true,
        value,
    })
}

function removeGlobal (name) {
    delete global[name]
}

function restoreGlobal (name) {
    const descriptor = originalDescriptors[name]
    if (descriptor) Object.defineProperty(global, name, descriptor)
    else removeGlobal(name)
}

function loadEnvs () {
    let subject
    jest.isolateModules(() => {
        subject = require('../_envs')
    })
    return subject
}

function setNodeEnv (value) {
    if (value === undefined) delete process.env.NODE_ENV
    else process.env.NODE_ENV = value
}

beforeEach(() => {
    GLOBAL_NAMES.forEach(removeGlobal)
    setNodeEnv(originalNodeEnv)
})

afterEach(() => {
    GLOBAL_NAMES.forEach(restoreGlobal)
    setNodeEnv(originalNodeEnv)
})

afterAll(() => {
    GLOBAL_NAMES.forEach(restoreGlobal)
    setNodeEnv(originalNodeEnv)
})

describe('_envs server loading contract', () => {
    it.each([
        ['production', true, false, false, false, true],
        ['stage', false, true, false, false, true],
        ['test', false, false, true, false, false],
        ['development', false, false, false, true, false],
        ['preview', false, false, false, false, false],
    ])(
        'derives mutually exclusive flags from NODE_ENV=%s',
        (nodeEnv, prod, stage, test, dev, init) => {
            setNodeEnv(nodeEnv)

            const subject = loadEnvs()

            expect(subject.ENV).toBe(process.env)
            expect(subject.NODE_ENV).toBe(nodeEnv)
            expect(subject).toMatchObject({
                __PROD__: prod,
                __STAGE__: stage,
                __TEST__: test,
                __DEV__: dev,
                __CLIENT__: false,
                __BACKEND__: true,
                __IOS__: false,
                _INIT_: init,
            })
            expect(subject._WORK_DIR_).toBe(process.cwd())
        },
    )

    it('uses safe fallbacks when process is unavailable', () => {
        const processDescriptor = Object.getOwnPropertyDescriptor(global, 'process')
        let subject

        try {
            setGlobal('process', undefined)
            subject = loadEnvs()
        } finally {
            Object.defineProperty(global, 'process', processDescriptor)
        }

        expect(subject.ENV).toEqual({})
        expect(subject.NODE_ENV).toBeUndefined()
        expect(subject._WORK_DIR_).toBe('.')
        expect(subject).toMatchObject({
            __PROD__: false,
            __STAGE__: false,
            __TEST__: false,
            __DEV__: false,
            __CLIENT__: false,
            __BACKEND__: true,
            _INIT_: false,
        })
    })

    it('does not treat a standalone location object as a browser', () => {
        setGlobal('location', { origin: 'https://server.example', pathname: '/render' })

        const subject = loadEnvs()

        expect(subject.__CLIENT__).toBe(false)
        expect(subject.__BACKEND__).toBe(true)
    })

    it('does not expose browser-only adapters', () => {
        const subject = loadEnvs()

        expect(subject.Active.Storage).toBeUndefined()
        expect(subject.Active.WebSocket).toBeUndefined()
    })

    it('uses the backend password checker slot and setter', () => {
        const { Active } = loadEnvs()

        expect(Active.passwordCheck).toBeUndefined()

        const checker = value => ({ score: 4, value })
        Active.passwordCheck = checker

        expect(Active.zxcvbn).toBe(checker)
        expect(Active.passwordCheck).toBe(checker)
        expect(Active.passwordCheck('secret')).toEqual({ score: 4, value: 'secret' })
    })
})

describe('_envs browser loading contract', () => {
    function installBrowser ({ zxcvbn } = {}) {
        const fakeLocation = { origin: 'https://ui.example', pathname: '/render' }
        const fakeStorage = { kind: 'storage' }
        class FakeWebSocket {}
        const fakeWindow = { location: fakeLocation }
        if (zxcvbn) fakeWindow.zxcvbn = zxcvbn

        setGlobal('window', fakeWindow)
        setGlobal('location', fakeLocation)
        setGlobal('localStorage', fakeStorage)
        setGlobal('WebSocket', FakeWebSocket)

        return { fakeLocation, fakeStorage, FakeWebSocket, fakeWindow }
    }

    it.each(['production', 'stage', 'test', 'development'])(
        'detects the client and never enables backend init in %s',
        nodeEnv => {
            setNodeEnv(nodeEnv)
            const browser = installBrowser()

            const subject = loadEnvs()

            expect(subject.__CLIENT__).toBe(true)
            expect(subject.__BACKEND__).toBe(false)
            expect(subject._INIT_).toBe(false)
            expect(subject._WORK_DIR_).toBe(process.cwd())
            expect(window.location).toBe(browser.fakeLocation)
        },
    )

    it('captures localStorage and WebSocket at module initialization', () => {
        const browser = installBrowser()

        const { Active } = loadEnvs()

        expect(Active.Storage).toBe(browser.fakeStorage)
        expect(Active.WebSocket).toBe(browser.FakeWebSocket)

        setGlobal('localStorage', { kind: 'replacement' })
        setGlobal('WebSocket', class ReplacementWebSocket {})
        expect(Active.Storage).toBe(browser.fakeStorage)
        expect(Active.WebSocket).toBe(browser.FakeWebSocket)
    })

    it('returns the permissive frontend fallback when zxcvbn is not loaded', () => {
        installBrowser()
        const { Active } = loadEnvs()

        expect(Active.passwordCheck('anything')).toEqual({ score: Infinity })
    })

    it('reads a checker added to window after module initialization', () => {
        const browser = installBrowser()
        const { Active } = loadEnvs()
        const checker = value => ({ score: 3, value })

        browser.fakeWindow.zxcvbn = checker

        expect(Active.passwordCheck).toBe(checker)
        expect(Active.passwordCheck('secret')).toEqual({ score: 3, value: 'secret' })
    })

    it('stores a setter value but keeps the documented frontend resolution order', () => {
        const windowChecker = value => ({ score: 2, value })
        installBrowser({ zxcvbn: windowChecker })
        const { Active } = loadEnvs()
        const assignedChecker = value => ({ score: 4, value })

        Active.passwordCheck = assignedChecker

        expect(Active.zxcvbn).toBe(assignedChecker)
        expect(Active.passwordCheck).toBe(windowChecker)
    })
})

describe('_envs stable defaults contract', () => {
    it('exports language, identity translation, mutable integration slots, and undefined sentinel', () => {
        const { Active, UNDEFINED } = loadEnvs()

        expect(UNDEFINED).toBeUndefined()
        expect(Active.DEFAULT).toEqual({ LANGUAGE: 'en' })
        expect(Active.LANG._).toBe('en')
        expect(Active.translate('unchanged')).toBe('unchanged')
        expect(Active).toMatchObject({
            history: {},
            iconClass: '',
            iconClassPrefix: 'icon-',
            client: undefined,
            log: undefined,
            user: {},
            usersById: {},
        })
    })

    it('snapshots environment flags while preserving the mutable ENV reference', () => {
        setNodeEnv('test')
        const subject = loadEnvs()
        const originalContractValue = process.env.ENVS_CONTRACT_VALUE

        process.env.NODE_ENV = 'production'
        process.env.ENVS_CONTRACT_VALUE = 'changed-after-load'

        try {
            expect(subject.NODE_ENV).toBe('test')
            expect(subject.__TEST__).toBe(true)
            expect(subject.__PROD__).toBe(false)
            expect(subject.ENV.NODE_ENV).toBe('production')
            expect(subject.ENV.ENVS_CONTRACT_VALUE).toBe('changed-after-load')
        } finally {
            if (originalContractValue === undefined) delete process.env.ENVS_CONTRACT_VALUE
            else process.env.ENVS_CONTRACT_VALUE = originalContractValue
        }
    })
})
