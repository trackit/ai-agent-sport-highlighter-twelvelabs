import {
  APIGatewayProxyWebsocketEventV2,
  APIGatewayProxyResult,
} from 'aws-lambda'

export const handler = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResult> => {
  const connectionId = event.requestContext.connectionId
  if (!connectionId) {
    return {
      statusCode: 400,
      body: 'Missing connection ID',
    }
  }

  return {
    statusCode: 200,
    body: 'Disconnected',
  }
}
