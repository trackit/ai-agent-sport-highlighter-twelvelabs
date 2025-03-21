import {
  APIGatewayProxyWebsocketEventV2,
  APIGatewayProxyResult,
} from 'aws-lambda'
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi'
import {
  BedrockAgentRuntimeClient,
  InvokeAgentCommand,
} from '@aws-sdk/client-bedrock-agent-runtime'

export interface SendMessageAction {
  action: 'sendMessage'
  message: string
  sessionId: string
}

type PossibleEvents = SendMessageAction

const handleSendMessage = async ({
  sessionId,
  message,
  connectionId,
  endpoint,
}: {
  message: string
  sessionId: string
  connectionId: string
  endpoint: string
}) => {
  const client = new BedrockAgentRuntimeClient()

  const agentId = process.env.BEDROCK_AGENT_ID!
  const agentAliasId = process.env.BEDROCK_AGENT_ALIAS_ID!

  const command = new InvokeAgentCommand({
    agentId,
    agentAliasId,
    sessionId,
    enableTrace: true,
    inputText: message,
    sessionState: {
      sessionAttributes: {
        connectionId,
        endpoint,
      },
    },
  })

  try {
    let completion = ''
    const response = await client.send(command)

    if (response.completion === undefined) {
      throw new Error('Completion is undefined')
    }

    for await (const chunkEvent of response.completion) {
      console.log(JSON.stringify(chunkEvent.trace, null, 2))
      const chunk = chunkEvent.chunk
      console.log(chunk)
      const decodedResponse = new TextDecoder('utf-8').decode(chunk?.bytes)
      completion += decodedResponse
      console.log(completion)
    }

    return { sessionId: sessionId, completion }
  } catch (err) {
    console.error(err)
    throw new Error('Error while using agent')
  }
}

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResult> => {
  console.log('Received event:', JSON.stringify(event))

  const { connectionId, domainName, stage } = event.requestContext

  const endpoint = `https://${domainName}/${stage}`

  const client = new ApiGatewayManagementApiClient({
    region: process.env.AWS_REGION,
    endpoint,
  })

  // Check if the connectionId is available
  if (!connectionId) {
    return {
      statusCode: 400,
      body: 'Missing connection ID',
    }
  }

  const body: PossibleEvents = JSON.parse(event.body || '{}')

  if (body.action === 'sendMessage') {
    const response = await handleSendMessage({
      sessionId: body.sessionId,
      message: body.message,
      connectionId: connectionId,
      endpoint: endpoint,
    })

    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: Buffer.from(response.completion),
    })

    await client.send(command)
  }

  return {
    statusCode: 200,
    body: 'Message processed successfully',
  }
}
