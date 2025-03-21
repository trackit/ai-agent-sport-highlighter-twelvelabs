/// <reference path="./.sst/platform/config.d.ts" />

import * as process from 'node:process'
import fs from 'fs'
import postProcessingPrompt from './packages/backend/prompt.postProcessing'

const tags = {
  Owner: 'OWNER',
  Project: 'PROJECT',
  Name: 'NAME',
}

export default $config({
  app(input) {
    return {
      name: 'genai-twelvelabs',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      home: 'aws',
      tags: tags,
    }
  },
  async run() {
    /**
     * AWS Bedrock
     */

    const bucket = new sst.aws.Bucket('AgentBucket', {})

    // Waiting on a fix. https://github.com/sst/sst/issues/5565
    // const ffmpegLayer = new aws.lambda.LayerVersion('ffmpegLayer2', {
    //   layerName: `ffmpegLayer-${$app.stage}`,
    //   code: new $util.asset.FileArchive('./ffmpeg-layer.zip'),
    //   description: 'Static build of ffmpeg',
    //   compatibleArchitectures: ['x86_64'],
    //   licenseInfo: 'https://ffmpeg.org/legal.html',
    // })

    const actionGroupHandler = new sst.aws.Function(`actionGroupHandler`, {
      handler: 'packages/backend/src/bedrockAgent/handler.handler',
      tags,
      timeout: '15 minutes',
      environment: {
        TWELVELABS_API_KEY: process.env.TWELVELABS_API_KEY,
        TWELVELABS_HIGHLIGHTS_INDEX_ID:
          process.env.TWELVELABS_HIGHLIGHTS_INDEX_ID,

        ICONIK_APP_ID: process.env.ICONIK_APP_ID,
        ICONIK_API_KEY: process.env.ICONIK_API_KEY,
        ICONIK_METADATA_MATCH_VIEW: process.env.ICONIK_METADATA_MATCH_VIEW,
        ICONIK_COLLECTION_ID: process.env.ICONIK_COLLECTION_ID,

        SHORTIO_API_KEY: process.env.SHORTIO_API_KEY,
        SHORTIO_DOMAIN: process.env.SHORTIO_DOMAIN,

        BUCKET_NAME: bucket.name,
      },
      layers: [
        // ADD FFMPEG LAYER ARN// ADD FFMPEG LAYER ARN
      ],
      permissions: [
        {
          actions: ['execute-api:*'],
          resources: ['*'],
        },
      ],
      link: [bucket],
    })

    new aws.lambda.Permission('bedrockLambdaPermission', {
      action: 'lambda:InvokeFunction',
      function: actionGroupHandler.arn,
      principal: 'bedrock.amazonaws.com',
    })

    const current = await aws.getCallerIdentity({})
    const currentGetPartition = await aws.getPartition({})
    const currentGetRegion = await aws.getRegion({})

    const agentTrust = aws.iam.getPolicyDocument({
      statements: [
        {
          actions: ['sts:AssumeRole'],
          principals: [
            {
              identifiers: ['bedrock.amazonaws.com'],
              type: 'Service',
            },
          ],
          conditions: [
            {
              test: 'StringEquals',
              values: [current.accountId],
              variable: 'aws:SourceAccount',
            },
            {
              test: 'ArnLike',
              values: [
                `arn:${currentGetPartition.partition}:bedrock:${currentGetRegion.name}:${current.accountId}:agent/*`,
              ],
              variable: 'AWS:SourceArn',
            },
          ],
        },
      ],
    })

    const role = new aws.iam.Role($app.stage, {
      assumeRolePolicy: agentTrust.then(
        (exampleAgentTrust) => exampleAgentTrust.json
      ),
      namePrefix: 'AmazonBedrockExecutionRoleForAgents_',
    })

    const agentPermissions = aws.iam.getPolicyDocument({
      statements: [
        {
          actions: [
            'bedrock:InvokeModel',
            'bedrock:InvokeModelWithResponseStream',
          ],
          resources: [
            `arn:${currentGetPartition.partition}:bedrock:${currentGetRegion.name}::foundation-model/anthropic.claude-3-5-sonnet-20241022-v2:0`,
          ],
        },
      ],
    })

    new aws.iam.RolePolicy('invokeModelRolePolicy', {
      policy: agentPermissions.then((agentPermission) => agentPermission.json),
      role: role.id,
    })

    const agentAgent = new aws.bedrock.AgentAgent('twelvelabsIconikAgent', {
      agentName: `twelvelabs-iconik-agent-${$app.stage}`,
      agentResourceRoleArn: role.arn,
      idleSessionTtlInSeconds: 900,
      foundationModel: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
      instruction: fs
        .readFileSync('./packages/backend/agent.instructions.md', 'utf-8')
        .toString(),
      promptOverrideConfigurations: [
        {
          overrideLambda: null,
          promptConfigurations: [
            {
              parserMode: 'DEFAULT',
              promptType: 'POST_PROCESSING',
              promptCreationMode: 'OVERRIDDEN',
              promptState: 'ENABLED',
              basePromptTemplate: postProcessingPrompt,
              inferenceConfigurations: [
                {
                  temperature: 0,
                  topP: 1,
                  topK: 250,
                  maxLength: 2048,
                  stopSequences: ['\n\nHuman:'],
                },
              ],
            },
          ],
        },
      ],
      prepareAgent: true,
    })

    const agentAgentActionGroup = new aws.bedrock.AgentAgentActionGroup(
      'twelvelabsIconikConnectors',
      {
        actionGroupName: 'twelvelabs-iconik-connectors',
        agentId: agentAgent.agentId,
        agentVersion: 'DRAFT',
        skipResourceInUseCheck: true,
        actionGroupExecutor: {
          lambda: actionGroupHandler.arn,
        },
        apiSchema: {
          payload: fs
            .readFileSync('./packages/backend/openapi.json')
            .toString(),
        },
      }
    )

    const random = Date.now().toString(36)
    const agentAlias = new aws.bedrock.AgentAgentAlias(
      `twelveLabsIconikAgentAlias-${random}`,
      {
        agentId: agentAgent.agentId,
        agentAliasName: `live-alias-${random}`,
        routingConfigurations: undefined,
      },
      {
        dependsOn: [agentAgentActionGroup],
      }
    )

    /**
     * AWS API Gateway
     */

    const api = new sst.aws.ApiGatewayWebSocket('chatbotAPI')

    api.route(
      '$connect',
      'packages/backend/src/chatbot/connect.handler.handler'
    )

    api.route(
      '$disconnect',
      'packages/backend/src/chatbot/disconnect.handler.handler'
    )

    api.route('$default', {
      handler: 'packages/backend/src/chatbot/default.handler.handler',
      link: [api],
      timeout: '15 minutes',
      environment: {
        BEDROCK_AGENT_ID: agentAgent.agentId,
        BEDROCK_AGENT_ALIAS_ID: agentAlias.agentAliasId,
      },
      permissions: [
        {
          actions: ['bedrock:InvokeAgent'],
          resources: [agentAlias.agentAliasArn],
        },
      ],
    })
  },
})
