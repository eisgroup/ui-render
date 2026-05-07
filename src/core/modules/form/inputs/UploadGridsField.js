import { asField } from '..'
import UploadGrids from '../../upload/views/UploadGrids'

/**
 * @see UploadGridField for docs.
 */
export default asField(UploadGrids, {sanitize: (value) => value || []})
