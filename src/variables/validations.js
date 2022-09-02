import { SIZE_KB } from 'ui-utils-pack'

export const VALIDATE = {
  ABOUT_MAX_LENGTH: 700 * 7, // 700 words, with average 7 characters per word
  ADDRESS_MAX_LENGTH: 256, // 95 - Street, 35 - City, 35 - State, 35 - Country
  FILE_NAME_MAX_LENGTH: 30,
  IMAGE_MAX_PIXELS: 1200, // max dimension to resize images to for typical blog use
  IMAGE_RES_LIMIT: (SIZE_KB * 16) * (SIZE_KB * 16) * 4, // limit for processing images
  NAME_MAX_LENGTH: 150,
}
