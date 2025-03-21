const postProcessing = {
  anthropic_version: 'bedrock-2023-05-31',
  system: '',
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `You should format the answer correctly so it can be handled by the client.
                
                Expected response format:
                {
                  "$schema": "http://json-schema.org/draft-07/schema#",
                  "title": "MessageWithEmbeddedContent",
                  "type": "object",
                  "properties": {
                    "message": {
                      "type": "string"
                    },
                    "media": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "title": {
                            "type": "string"
                          },
                          "poster": {
                            "type": "string"
                          },
                          "url": {
                            "type": "string"
                          }
                        },
                        "required": ["title", "poster", "url"]
                      }
                    },
                     "files": {
                        "type": "array",
                        "items": {
                           "type": "object",
                           "properties": {
                              "name": {
                                 "type": "string"
                              },
                              "url": {
                                 "type": "string"
                              }
                           },
                           "required": ["name", "url"]
                        }
                     }
                  },
                  "required": ["message"]
                }
                
                At times, the function calling agent produces responses that may seem confusing to the user because the user lacks context of the actions the function calling agent has taken. Here's an example:
                <example>
                    The user tells the function calling agent: 'Acknowledge all policy engine violations under me. My alias is jsmith, start date is 09/09/2023 and end date is 10/10/2023.'
                    After calling a few API's and gathering information, the function calling agent responds, 'What is the expected date of resolution for policy violation POL-001?'
                    This is problematic because the user did not see that the function calling agent called API's due to it being hidden in the UI of our application. Thus, we need to provide the user with more context in this response. This is where you augment the response and provide more information.
                    Here's an example of how you would transform the function calling agent response into our ideal response to the user. This is the ideal final response that is produced from this specific scenario: 
                    {
                      "message": "Based on the provided data, there are 2 policy violations that need to be acknowledged - POL-001 with high risk level created on 2023-06-01, and POL-002 with medium risk level created on 2023-06-02. What is the expected date of resolution date to acknowledge the policy violation POL-001?"
                    }
                </example>
                <example>
                One of the agent could reply with a response like this:
                'I have found the following policy violations:
                    {
                      "message": "Based on the provided data, there are 2 policy violations that need to be acknowledged - POL-001 with high risk level created on 2023-06-01, and POL-002 with medium risk level created on 2023-06-02. What is the expected date of resolution date to acknowledge the policy violation POL-001?"
                    }
                '
                You need to remove the extra phrase and give the final response as follow:
                '{
                      "message": "Based on the provided data, there are 2 policy violations that need to be acknowledged - POL-001 with high risk level created on 2023-06-01, and POL-002 with medium risk level created on 2023-06-02. What is the expected date of resolution date to acknowledge the policy violation POL-001?"
                }'
                </example>
                It's important to note that the ideal answer does not expose any underlying implementation details that we are trying to conceal from the user like the actual names of the functions.
                Do not ever include any API or function names or references to these names in any form within the final response you create. An example of a violation of this policy would look like this: 'To update the order, I called the order management APIs to change the shoe color to black and the shoe size to 10.' The final response in this example should instead look like this: 'I checked our order management system and changed the shoe color to black and the shoe size to 10.'
                Now you will try creating a final response. Here's the original user input <user_input>$question$</user_input>.
                Here is the latest raw response from the function calling agent that you should transform: <latest_response>$latest_response$</latest_response>.
                And here is the history of the actions the function calling agent has taken so far in this conversation: <history>$responses$</history>.
                Please output your transformed response within <final_response></final_response> XML tags.`,
        },
      ],
    },
  ],
}

const stringifiedPrompt = JSON.stringify(postProcessing, null, 2)

export default stringifiedPrompt
