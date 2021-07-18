## Image Uploads

Images usually need different sizes:

1. Thumbnail/Avatar cropped (for quick preview in search results)
2. Medium/Default (for balance between quality and speed)
3. Large/Original (for high definition view)

For the best UX, resizing should happen automatically on upload, like WordPress. With option to override the default
size after upload, so that UI can sync width/height.

=> Should have an `imagesUploaded` decorator that extends the functionality of `filesUploaded`. It will have adhoc logic
for updating image dimensions, with default config for thumbnails.

=> Use `Img` type for Mongoose field, that extends `FileType` with `width/height`.

### Dimension vs. Resolution restriction

For typical blog, it makes sense to restrict by max width/height. For Texture used in 3D apps, only total resolution
matters because it affects performance.

Restriction should then be customisable.

### Scenarios:

1. Image uploaded the first time (Width/Height is `null`):
   - resize original, duplicate to default size, and thumb with common config.
   - always create all sizes so there is no need to check for metadata.
   - create only one `Img` db record for the upload.
   - set width/height from original file for the db record.

2. Image re-uploaded:
   - if width/height/resolution is sent along, resize default to given parameters

3. only width/height/resolution changed
   - resize the default version using the original

=> Need interface to adjust image dimensions with preview

