import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import stream from 'stream'
import { assertBackend, ENV, warn } from 'ui-utils-pack'

/**
 * CDN S3 CLIENT HELPERS =======================================================
 * CRUD Operations using S3 Client for AWS or DO Spaces
 * =============================================================================
 */
assertBackend()

const s3Name = ENV.CDN_BUCKET_NAME || 'cdn'
const s3Key = ENV.CDN_ACCESS_KEY
const s3Pass = ENV.CDN_ACCESS_PASS
const keyFilterPattern = /^\/+/

/**
 * S3 Client for Browser, Node.js and React Native.
 * https://docs.digitalocean.com/products/spaces/resources/s3-sdk-examples/
 *
 * @example:
 *    const cdn = new Cdn()
 *    cdn.upload()
 */
export class S3 {
  constructor (
    accessKeyId = s3Key,
    secretAccessKey = s3Pass,
    endpoint = 'https://nyc3.digitaloceanspaces.com',
    region = 'us-east-1',
    params = {
      ACL: 'public-read',
      Bucket: s3Name, // DO Space name
    }
  ) {
    if (accessKeyId == null) throw new Error(`Cdn requires env variable CDN_ACCESS_KEY`)
    if (secretAccessKey == null) throw new Error(`Cdn requires env variable CDN_ACCESS_PASS`)

    // The s3Client function validates your request and directs it to DO Space's specified endpoint using the AWS SDK.
    this.client = new S3Client({
      endpoint, // Find your endpoint in the control panel, under Settings. Prepend "https://".
      region, // Must be "us-east-1" when creating new DO Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
      credentials: {
        accessKeyId, // Access key pair. You can create access key pairs using the control panel or API.
        secretAccessKey, // Secret access key defined through an environment variable.
      }
    })
    this.params = params
    return this
  }

  getParams = ({Key, ...params}) => {
    // S3 client expects `Key` to not begin with slash -> remove all leading slashes
    return {...this.params, Key: Key.replace(keyFilterPattern, ''), ...params}
  }

  /**
   * Uploads an object using SDK's PutObjectCommand and returns promise.
   * @example:
   *  - cdn.upload({Key: `${dir}/${fileName}`, Body: file}
   *  - const params = {
   *      Bucket: 'space-name/folder/', // The path to the directory you want to upload the object to, starting with your Space name.
   *      Key: 'hello-world.txt', // Object key, referenced whenever you want to access this file later.
   *      Body: 'Hello, World!', // The object's contents. This variable is an object, not a string.
   *      ACL: 'private', // Defines ACL permissions, such as private or public. https://docs.digitalocean.com/reference/api/spaces-api/
   *      Metadata: { // Defines metadata tags.
   *        'x-amz-meta-my-key': 'your-value'
   *      }
   *    }
   * @param {Object} params
   * @returns {Promise<*|Error>}
   */
  upload = (params) => this.client.send(new PutObjectCommand(this.getParams(params)))

  /**
   * Delete object from S3
   * @example:
   *  - cdn.upload({Key: `${dir}/${fileName}`}
   *
   * @param {Object} params
   * @returns {Promise<*|Error>}
   */
  remove = async (params) => this.client.send(new DeleteObjectCommand(this.getParams(params)))

  /**
   * Create writeStream for Node.js file streaming to S3 bucket.
   * https://stackoverflow.com/questions/69884898/how-to-upload-a-stream-to-s3-with-aws-sdk-v3
   * @example:
   *    fileStream.pipe(s3.uploadStream({Key: path, ContentType: mimetype}))
   *      .on('error', error => reject(error))
   *      .on('finish', () => resolve({path, name}))
   *
   * @param {Object} params - S3 Object params
   * @returns {writeStream: module:stream.internal.PassThrough} writeStream to pipe with
   */
  uploadStream = (params) => {
    params = this.getParams({...params, Body: new stream.PassThrough()})
    const upload = new Upload({client: this.client, params})
    upload.done().then((res, error) => {
      if (error) warn(error)
    }).catch(warn)
    return params.Body
  }
}

export const s3 = (s3Key && s3Pass) ? new S3() : undefined
export default s3
