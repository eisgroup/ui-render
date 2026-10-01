import { FILE, IMAGE, UPLOAD } from '../files'

describe('FILE constants', () => {
    it('exposes file extensions', () => {
        expect(FILE.EXT.JSON).toBe('json')
        expect(FILE.EXT.PNG).toBe('png')
    })
    it('exposes the upload file types', () => {
        expect(FILE.TYPE.JSON).toBe('json')
        expect(FILE.TYPE.IMAGE).toBe('image')
    })
})

describe('IMAGE / UPLOAD', () => {
    it('exposes image extension whitelist', () => {
        expect(IMAGE.EXTENSIONS).toContain('jpg')
        expect(IMAGE.EXTENSIONS).toContain('png')
    })
    it('exposes upload route configs', () => {
        expect(UPLOAD.BY_ROUTE[FILE.TYPE.IMAGE].fileTypes).toContain('.png')
        expect(UPLOAD.BY_ROUTE[FILE.TYPE.JSON].fileTypes).toBe('.json')
    })
})
