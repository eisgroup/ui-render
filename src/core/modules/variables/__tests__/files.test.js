import { FILE, IMAGE, UPLOAD, fileName, fileNameSized, fileId, folderFrom, resolvePath } from '../files'

describe('FILE constants', () => {
    it('exposes file extensions', () => {
        expect(FILE.EXT.JSON).toBe('json')
        expect(FILE.EXT.PNG).toBe('png')
    })
    it('exposes mime types', () => {
        expect(FILE.MIME_TYPE.JPG).toBe('image/jpeg')
        expect(FILE.MIME_TYPE.JSON).toBe('application/json')
    })
    it('maps mime types back to format names', () => {
        expect(FILE.FORMAT_BY_MIME_TYPE['image/png']).toBe('png')
        expect(FILE.FORMAT_BY_MIME_TYPE['application/json']).toBe('json')
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

describe('fileName', () => {
    it('builds id/kind_i.ext', () => {
        expect(fileName({ id: 'test', kind: 'public', i: 'thumb', name: 'x.jpg' })).toBe('test/public_thumb.jpg')
    })
    it('omits underscore when only one of kind/i is set', () => {
        expect(fileName({ id: 'test', kind: 'public', name: 'x.jpg' })).toBe('test/public.jpg')
    })
    it('handles missing id', () => {
        expect(fileName({ kind: 'public', name: 'x.jpg' })).toBe('public.jpg')
    })
    it('handles only extension', () => {
        expect(fileName({ name: 'x.jpg' })).toBe('.jpg')
    })
    it('produces id/i with no extension', () => {
        expect(fileName({ id: 'test', i: 'thumb' })).toBe('test/thumb')
    })
    it('produces id.ext when no kind/i', () => {
        expect(fileName({ id: 'test', name: 'x.jpg' })).toBe('test.jpg')
    })
})

describe('fileNameSized', () => {
    it('appends a size suffix before the extension', () => {
        expect(fileNameSized('photo.jpg', 'thumb')).toBe('photo_thumb.jpg')
    })
    it('returns the filename unchanged when size is empty', () => {
        expect(fileNameSized('photo.jpg', '')).toBe('photo.jpg')
    })
    it('handles files without extension', () => {
        expect(fileNameSized('photo', 'thumb')).toBe('photo_thumb')
    })
})

describe('fileId', () => {
    it('delegates to fileName but ignores name and ext fields', () => {
        expect(fileId({ id: 'test', kind: 'public', i: 'thumb', name: 'x.jpg', ext: 'jpg' })).toBe('test/public_thumb')
    })
})

describe('folderFrom', () => {
    it('builds /ModelName/id from a Mongoose-like instance', () => {
        const instance = { id: 7, constructor: { modelName: 'User' } }
        expect(folderFrom(instance)).toBe('/User/7')
    })
})

describe('resolvePath', () => {
    it('throws without filename or path', () => {
        expect(() => resolvePath({})).toThrow(/requires either 'filename' or full absolute 'path'/)
    })
    it('builds path from filename + folder + workDir', () => {
        const out = resolvePath({ filename: 'a.jpg', folder: '/foo', workDir: '/root' })
        expect(out.path).toBe('/root/foo/a.jpg')
        expect(out.dir).toBe('/root/foo')
        expect(out.name).toBe('a.jpg')
    })
    it('parses an absolute path into dir/name', () => {
        const out = resolvePath({ path: '/root/uploads/photo.jpg' })
        expect(out.dir).toBe('/root/uploads')
        expect(out.name).toBe('photo.jpg')
    })
    it('honors a custom dir', () => {
        const out = resolvePath({ filename: 'a.jpg', dir: '/abs' })
        expect(out.path).toBe('/abs/a.jpg')
    })
    it('handles extension-only filename', () => {
        const out = resolvePath({ filename: '.jpg', dir: '/abs' })
        expect(out.path).toBe('/abs.jpg')
        expect(out.dir).toBe('/abs.jpg'.substr(0, '/abs.jpg'.lastIndexOf('/')))
    })
})
