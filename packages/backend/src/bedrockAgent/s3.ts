import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { shortenUrl } from './urlShortener'

/**
 * Creates a file in the S3 bucket and returns a signed URL for sharing
 * @param text - The text content to store in the file
 * @param fileName - The name of the file to create
 * @returns A signed URL that can be used to access the file
 */
const createFileToShare = async ({
  text,
  fileName,
}: {
  text: string
  fileName: string
}) => {
  try {
    const s3Client = new S3Client({})

    const bucketName = process.env.BUCKET_NAME

    if (!bucketName) {
      throw new Error('Bucket name not found in environment variables')
    }

    const filePath = fileName

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: text,
      ContentType: 'text/plain',
    })

    await s3Client.send(putCommand)

    const getCommand = new GetObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      ResponseContentDisposition: `attachment; filename="${fileName}"`,
    })

    const signedUrl = await getSignedUrl(s3Client, getCommand, {
      expiresIn: 604800,
    })

    return {
      success: true,
      url: await shortenUrl({ url: signedUrl }),
      fileName,
    }
  } catch (error) {
    console.error('Error creating file to share:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export { createFileToShare }
