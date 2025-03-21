import { TwelveLabs } from 'twelvelabs-js'
import { addTwelveLabsVideoIdMetadata } from './iconik'

const client = new TwelveLabs({ apiKey: process.env.TWELVELABS_API_KEY! })

export const getHighlights = async ({
  videoId,
  prompt,
}: {
  videoId: string
  prompt: string
}) => {
  const highlights = await client.generate.summarize(
    videoId,
    'highlight',
    prompt,
    0.01
  )

  for (const highlight of highlights.highlights || []) {
    console.log(
      `Highlight: ${highlight.highlight}, start: ${highlight.start}, end: ${highlight.end}`
    )
  }

  return highlights
}

export const getHighlightsWithQuery = async ({
  videoId,
  query,
}: {
  videoId: string
  query: string
}) => {
  console.log({
    indexId: process.env.TWELVELABS_HIGHLIGHTS_INDEX_ID!,
    queryText: query,
    threshold: 'high',
    filter: {
      id: [videoId],
    },
  })

  const searchResult = await client.search.query({
    indexId: process.env.TWELVELABS_HIGHLIGHTS_INDEX_ID!,
    queryText: query,
    threshold: 'high',
    filter: {
      id: [videoId],
    },
    options: ['visual', 'audio'],
  })

  console.log(JSON.stringify(searchResult.data, null, 2))

  return searchResult.data
}

export const getHighlightsWithQueries = async ({
  videoId,
  queries,
}: {
  videoId: string
  queries: {
    query: string
    tags: string[]
  }[]
}) => {
  console.log(JSON.stringify(queries, null, 2))

  const taggedHighlights = await Promise.all(
    queries.map(async ({ query, tags }) => {
      const searchResult = await client.search.query({
        indexId: process.env.TWELVELABS_HIGHLIGHTS_INDEX_ID!,
        queryText: query,
        threshold: 'high',
        filter: {
          id: [videoId],
        },
        options: ['visual', 'audio'],
      })

      return searchResult.data.map((highlight: any) => ({
        ...highlight,
        tags,
      }))
    })
  )

  return taggedHighlights.flat().sort((a, b) => a.start - b.start)
}

export const uploadFileToHighlightIndex = async ({
  videoUrl,
  assetId,
}: {
  videoUrl: string
  assetId: string
}) => {
  try {
    const task = await client.task.create({
      indexId: process.env.TWELVELABS_HIGHLIGHTS_INDEX_ID!,
      url: videoUrl,
    })
    console.log(`Task id=${task.id} Video id=${task.videoId}`)

    if (task.videoId) {
      await addTwelveLabsVideoIdMetadata({
        assetId,
        // @ts-expect-error type is invalid
        videoId: task.videoId,
      })
    }

    return {
      message: 'Task created.',
      task: {
        taskId: task.id,
        videoId: task.videoId,
        status: task.status,
      },
    }
  } catch (error) {
    console.error('Error uploading file to highlight index:', error)
    return error instanceof Error ? error.message : 'Unknown error'
  }
}

export const checkTaskStatus = async ({ taskId }: { taskId: string }) => {
  try {
    const task = await client.task.retrieve(taskId)

    return {
      message: 'Task status.',
      task: {
        taskId: task.id,
        videoId: task.videoId,
        status: task.status,
      },
    }
  } catch (error) {
    console.error('Error checking task status:', error)
    return error instanceof Error ? error.message : 'Unknown error'
  }
}
