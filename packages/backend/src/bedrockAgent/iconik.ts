import fetch from 'node-fetch'
import * as process from 'node:process'
import { shortenUrl } from './urlShortener'

export const search = async ({ query }: { query: string }) => {
  try {
    const response = await fetch(
      `https://app.aws.iconik.io/API/search/v1/search/?page=1&per_page=10&generate_signed_proxy_url=true`,
      {
        method: 'post',
        headers: {
          'App-ID': process.env.ICONIK_APP_ID!,
          'Auth-Token': process.env.ICONIK_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doc_types: ['assets'],
          include_fields: [
            'id',
            'title',
            'keyframes',
            'object_type',
            'type',
            'proxies',
            'files',
            'format',
            'formats',
            'storage_id',
            'parent_id',
            'in_collections',
            'metadata',
            'time_end_milliseconds',
            'time_start_milliseconds',
            'face_recognition_status',
            'has_unconfirmed_persons',
            'archive_status',
            'analyze_status',
            'files.storage_id',
            'files.size',
            'date_created',
            'date_modified',
            'media_type',
            'duration',
          ],
          sort: [{ name: 'title', order: 'desc' }],
          query,
          filter: {
            operator: 'AND',
            terms: [
              {
                name: 'ancestor_collections',
                value_in: [process.env.ICONIK_COLLECTION_ID!],
              },
              { name: 'status', value_in: ['ACTIVE'] },
            ],
          },
          facets_filters: [],
          search_fields: [
            'title',
            'description',
            'segment_text',
            'file_names',
            'metadata',
          ],
        }),
      }
    )

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data: any = await response.json()

    /**
     * This is to reduce the payload size we are returning.
     */
    return Promise.all(
      data?.objects.map(async (object: any) => {
        return {
          id: object.id,
          metadata: object.metadata,
          keyframes: await Promise.all(
            object.keyframes.map(async (keyframe: any) => {
              return {
                name: keyframe.name,
                resolution: keyframe.resolution,
                url: keyframe.url
                  ? await shortenUrl({ url: keyframe.url })
                  : undefined,
              }
            })
          ),
          proxies: await Promise.all(
            object.proxies.map(async (proxy: any) => {
              return {
                name: proxy.name,
                url: proxy.url
                  ? await shortenUrl({ url: proxy.url })
                  : undefined,
              }
            })
          ),
          files: object.files,
          time_end_milliseconds: object.time_end_milliseconds,
          time_start_milliseconds: object.time_start_milliseconds,
          title: object.title,
          type: object.type,
        }
      })
    )
  } catch (error) {
    console.error('Error fetching data:', error)
    return error instanceof Error ? error.message : 'Unknown error'
  }
}

export const addTwelveLabsVideoIdMetadata = async ({
  assetId,
  videoId,
}: {
  assetId: string
  videoId: string
}) => {
  try {
    console.log({
      method: 'PUT',
      headers: {
        'App-ID': process.env.ICONIK_APP_ID!,
        'Auth-Token': process.env.ICONIK_API_KEY!,
      },
      body: JSON.stringify({
        metadata_values: {
          'twelvelabs-video-id': { field_values: [{ value: videoId }] },
        },
      }),
    })
    const response = await fetch(
      `https://app.aws.iconik.io/API/metadata/v1/assets/${assetId}/views/${process.env.ICONIK_METADATA_MATCH_VIEW}/`,
      {
        method: 'PUT',
        headers: {
          'App-ID': process.env.ICONIK_APP_ID!,
          'Auth-Token': process.env.ICONIK_API_KEY!,
        },
        body: JSON.stringify({
          metadata_values: {
            'twelvelabs-video-id': { field_values: [{ value: videoId }] },
          },
        }),
      }
    )
    console.log(JSON.stringify(response, null, 2))

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const data = await response.json()

    console.log(JSON.stringify(data, null, 2))

    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    return error instanceof Error ? error.message : 'Unknown error'
  }
}
