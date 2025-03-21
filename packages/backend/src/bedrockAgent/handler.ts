import { search } from './iconik'
import {
  checkTaskStatus,
  getHighlights,
  getHighlightsWithQueries,
  uploadFileToHighlightIndex,
} from './twelveLabs'
import { createFileToShare } from './s3'
import { createClip } from './createClip'
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'

const sendLogMessageToWebSocket = async ({
  connectionId,
  event,
  region,
  endpoint,
}: {
  connectionId: string
  event: any
  region: string
  endpoint: string
}) => {
  const client = new ApiGatewayManagementApiClient({
    region,
    endpoint,
  })

  const command = new PostToConnectionCommand({
    ConnectionId: connectionId,
    Data: Buffer.from(
      JSON.stringify({
        type: 'log',
        message: JSON.stringify(
          {
            apiPath: event.apiPath,
            httpMethod: event.httpMethod,
            parameters: event.parameters,
            requestBody: event.requestBody,
          },
          null,
          2
        ),
      })
    ),
  })

  await client.send(command)
}

// Types for events are not available yet on @types/aws-lambda
export const handler = async (event: any) => {
  const {
    agent,
    actionGroup,
    apiPath,
    httpMethod,
    parameters,
    messageVersion,
    requestBody,
    sessionAttributes,
  } = event
  console.log(JSON.stringify(event))
  console.log(
    JSON.stringify(
      {
        endpoint: apiPath,
        parameters,
        requestBody,
      },
      null,
      2
    )
  )

  await sendLogMessageToWebSocket({
    connectionId: sessionAttributes.connectionId,
    event,
    region: process.env.AWS_REGION!,
    endpoint: sessionAttributes.endpoint,
  })

  const formatResponse = (body: unknown) => {
    console.log(
      JSON.stringify(
        {
          endpoint: apiPath,
          parameters,
          requestBody,
          response: body,
        },
        null,
        2
      )
    )

    return {
      messageVersion: messageVersion,
      response: {
        actionGroup,
        apiPath,
        httpMethod,
        httpStatusCode: 200,
        agent,
        responseBody: {
          'application/json': {
            body: JSON.stringify(body),
          },
        },
      },
    }
  }

  switch (apiPath) {
    case '/search/{query}': {
      const query = parameters.find((param: any) => param.name === 'query')
      const searchResponse = await search({ query: query.value })

      return formatResponse(searchResponse)
    }
    case '/indexForHighlights/{taskId}': {
      const taskId = parameters.find((param: any) => param.name === 'taskId')
      const taskStatus = await checkTaskStatus({ taskId: taskId.value })

      return formatResponse(taskStatus)
    }
    case '/highlights/{videoId}': {
      const videoId = parameters.find((param: any) => param.name === 'videoId')
      const prompt = parameters.find((param: any) => param.name === 'prompt')
      const highlights = await getHighlights({
        videoId: videoId.value,
        prompt: prompt.value,
      })

      return formatResponse(highlights)
    }
    case '/highlightsWithQuery': {
      const body = requestBody?.content?.['application/json']?.properties
      const videoId = body?.find((elem: any) => elem.name === 'videoId')
      const queryParam = body?.find((elem: any) => elem.name === 'query')
      const tagsParam = body?.find((elem: any) => elem.name === 'tags')

      const highlights = await getHighlightsWithQueries({
        videoId: videoId.value,
        queries: [
          {
            query: queryParam.value,
            tags: tagsParam.value,
          },
        ],
      })

      return formatResponse(highlights)
    }
    case '/indexForHighlights': {
      const body = requestBody?.content?.['application/json']?.properties
      const videoUrl = body?.find((elem: any) => elem.name === 'videoUrl')
      const assetId = body?.find((elem: any) => elem.name === 'assetId')

      const indexingResponse = await uploadFileToHighlightIndex({
        videoUrl: videoUrl.value,
        assetId: assetId.value,
      })

      return formatResponse(indexingResponse)
    }
    case '/shareFile': {
      const body = requestBody?.content?.['application/json']?.properties
      const text = body?.find((elem: any) => elem.name === 'text')
      const fileName = body?.find((elem: any) => elem.name === 'fileName')

      const shareFileResponse = await createFileToShare({
        text: text.value,
        fileName: fileName.value,
      })

      return formatResponse(shareFileResponse)
    }
    case '/generateClip': {
      const body = requestBody?.content?.['application/json']?.properties
      const signedUrl = body?.find((elem: any) => elem.name === 'signedUrl')
      const startTime = body?.find((elem: any) => elem.name === 'startTime')
      const endTime = body?.find((elem: any) => elem.name === 'endTime')

      const shareFileResponse = await createClip({
        signedUrl: signedUrl.value,
        startTime: startTime.value,
        endTime: endTime.value,
      })

      return formatResponse(shareFileResponse)
    }
    default:
      throw new Error('Function not implemented.')
  }
  console.log('coucou')
}
