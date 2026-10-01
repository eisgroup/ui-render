/**
 * WHERE A NAME-ONLY `Image` LOADS FROM.
 * =============================================================================================
 *
 * `common/variables/index.ts` sets FILE.PATH_IMAGES at load time from the env flags. Under jest the
 * flags follow Node's real process.env (NODE_ENV 'test'), so the production branch never runs here on
 * its own — yet it is the branch the PUBLISHED library always takes: its build bakes `process.env` to
 * `{NODE_ENV: 'production'}`, so __PROD__ is true and no homepage is ever set. From 0.32.4 that wrote
 * "undefined/static/images/". The flags are stubbed here to reach that branch; the packed-consumer
 * smoke (scripts/fixtures/packed-consumer.js) checks what the shipped bundle actually renders.
 */

/** Load the variables module fresh, with the flags stubbed, and return the FILE it writes to. */
const pathImagesFor = ({ prod, homepage }) => {
    let FILE
    jest.isolateModules(() => {
        jest.doMock('../../../utils', () => ({
            ...jest.requireActual('../../../utils'),
            __PROD__: prod,
            HOMEPAGE: homepage,
        }))
        // The object `Image` reads.
        FILE = require('../../../components/files').FILE
        require('..')
    })
    return FILE.PATH_IMAGES
}

describe('FILE.PATH_IMAGES', () => {
    it('stays at the web root in production when no homepage is set, as in the published library', () => {
        // Until this was fixed: "undefined/static/images/", which every host requested relative to the
        // page and got a 404.
        expect(pathImagesFor({ prod: true, homepage: undefined })).toBe('/static/images/')
    })

    it('stays at the web root in production for an empty homepage', () => {
        expect(pathImagesFor({ prod: true, homepage: '' })).toBe('/static/images/')
    })

    it('is prefixed with the homepage in production when one is set', () => {
        expect(pathImagesFor({ prod: true, homepage: '/home' })).toBe('/home/static/images/')
    })

    it('ignores the homepage outside production', () => {
        expect(pathImagesFor({ prod: false, homepage: '/home' })).toBe('/static/images/')
        expect(pathImagesFor({ prod: false, homepage: undefined })).toBe('/static/images/')
    })
})
