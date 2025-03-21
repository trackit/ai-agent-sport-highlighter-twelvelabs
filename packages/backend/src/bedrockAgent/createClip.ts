import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { spawn } from 'child_process'
import { randomUUID } from 'crypto'
import * as fs from 'fs'
import * as path from 'path'
import { shortenUrl } from './urlShortener'

// Set up environment for FFmpeg
process.env.PATH = `/opt/bin:${process.env.PATH || ''}`
process.env.LD_LIBRARY_PATH = `/opt/bin:${process.env.LD_LIBRARY_PATH || ''}`

// Lambda handler function
export const createClip = async ({
  signedUrl,
  startTime,
  endTime,
}: {
  signedUrl: string
  startTime: number
  endTime: number
}) => {
  try {
    const destinationBucket = process.env.BUCKET_NAME
    if (!destinationBucket) {
      throw new Error('DESTINATION_BUCKET environment variable is not set')
    }

    // Generate a unique output key for the clip
    const outputKey = `output_clip_${randomUUID()}.mp4`
    const outputPath = path.join('/tmp', outputKey)

    // Create FFmpeg command
    const duration = endTime - startTime

    // Run FFmpeg to create the clip
    await new Promise<void>((resolve, reject) => {
      const ffmpegPath = '/opt/bin/ffmpeg'
      console.log(`Using FFmpeg at: ${ffmpegPath}`)

      const ffmpeg = spawn(ffmpegPath, [
        '-i',
        signedUrl,
        '-ss',
        startTime.toString(),
        '-t',
        duration.toString(),
        '-c',
        'copy',
        outputPath,
      ])

      let stderr = ''

      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      ffmpeg.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`))
        } else {
          resolve()
        }
      })
    })

    // Upload the clip to S3
    const s3Client = new S3Client({})
    await s3Client.send(
      new PutObjectCommand({
        Bucket: destinationBucket,
        Key: outputKey,
        Body: fs.createReadStream(outputPath),
      })
    )

    // Generate a presigned URL for the uploaded clip
    const presignedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: destinationBucket,
        Key: outputKey,
      }),
      { expiresIn: 1800 }
    )

    const shortUrl = await shortenUrl({ url: presignedUrl })

    // Return the presigned URL
    return {
      statusCode: 201,
      clipSignedUrl: shortUrl,
    }
  } catch (error) {
    console.error('Error creating clip:', error)
    return {
      statusCode: 500,
      body: `Error creating clip: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}
