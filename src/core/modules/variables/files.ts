import { SIZE_MB_16 } from '../../utils'

/**
 * FILE VARIABLES ==============================================================
 * =============================================================================
 */

export const FILE = {
  EXT: {
    CSV: 'csv',
    GIF: 'gif',
    JSON: 'json',
    JPG: 'jpg',
    JPEG: 'jpeg',
    MP3: 'mp3',
    MP4: 'mp4',
    PNG: 'png',
    SVG: 'svg',
    WEBP: 'webp',
  },
  // File Uploads
  TYPE: {
    JSON: 'json',
    IMAGE: 'image',
    VIDEO: 'video',
  },
}

export const IMAGE = {
  EXTENSIONS: [FILE.EXT.JPG, FILE.EXT.JPEG, FILE.EXT.PNG, FILE.EXT.SVG, FILE.EXT.GIF, FILE.EXT.WEBP],
}

/** What a `fileType` gives an `Upload` that does not set its own `formats` and `maxSize`. */
export type UploadRouteDefaults = { fileTypes: string, maxSize: number }

export const UPLOAD: { BY_ROUTE: Record<string, UploadRouteDefaults> } = {
  BY_ROUTE: {
    [FILE.TYPE.JSON]: {fileTypes: '.json', maxSize: SIZE_MB_16},
    [FILE.TYPE.IMAGE]: {fileTypes: '.' + IMAGE.EXTENSIONS.join(', .'), maxSize: SIZE_MB_16},
    [FILE.TYPE.VIDEO]: {fileTypes: '.mp4', maxSize: SIZE_MB_16},
  },
}
