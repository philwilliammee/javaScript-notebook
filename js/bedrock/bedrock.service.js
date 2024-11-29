import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * Service to interact with AWS Bedrock Runtime.
 */
class BedrockService {
  /**
   * @param {object} config - Configuration for the AWS Bedrock Runtime client.
   * @param {string} config.region - AWS region for Bedrock.
   * @param {string} config.endpoint - Optional custom endpoint for Bedrock.
   */
  constructor(config) {
    this.client = new BedrockRuntimeClient(config);
  }

  /**
   * Invokes an AWS Bedrock model with the given input.
   *
   * @param {string} modelId - The ID of the Bedrock model to invoke.
   * @param {ClaudeRequestBody} body - Payload to send to the model.
   * @returns {Promise<object>} - Response from the model.
   */
  async invokeModel(modelId, body) {
    console.log("Invoking model:", modelId, body);
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    try {
      const response = await this.client.send(command);
      console.log(response.body);
      return JSON.parse(new TextDecoder("utf-8").decode(response.body));
    } catch (error) {
      console.error("Error invoking model:", error);
      throw error;
    }
  }
}

export { BedrockService };

/**
 * @typedef {object} BedrockInvocationInput
 * @property {string} inputText - Text input for the model.
 */

/**
 * @typedef {object} BedrockInvocationOutput
 * @property {string} outputText - Text output from the model.
 */

/**
 * @typedef {object} BedrockServiceConfig
 * @property {string} region - AWS region for Bedrock.
 * @property {string} [endpoint] - Optional custom endpoint for Bedrock.
 */

// export interface ClaudeRequestBody {
//   anthropic_version: string;
//   max_tokens: number;
//   system?: string; // this looks important
//   // A system prompt is a way of providing context and instructions to Anthropic Claude, such as specifying a particular goal or role. For more information, see How to use system prompts in the Anthropic documentation.
//   messages: Message[];
//   temperature?: number; // The amount of randomness injected into the response.
//   top_p?: number; // In nucleus sampling, Anthropic Claude computes the cumulative distribution over all the options for each subsequent token in decreasing probability order and cuts it off once it reaches a particular probability specified by top_p. You should alter either temperature or top_p, but not both.
//   top_k?: number; // Use top_k to remove long tail low probability responses.
//   stop_sequences?: string[];
//   // (Optional) Custom text sequences that cause the model to stop generating. Anthropic Claude models normally stop when they have naturally completed their turn, in this case the value of the stop_reason response field is end_turn. If you want the model to stop generating when it encounters custom strings of text, you can use the stop_sequences parameter. If the model encounters one of the custom text strings, the value of the stop_reason response field is stop_sequence and the value of stop_sequence contains the matched stop sequence.

//   // The maximum number of entries is 8191.
// }

/**
 * @typedef {object} ClaudeRequestBody
 * @property {string} anthropic_version - Version of the Anthropic API.
 * @property {number} max_tokens - Maximum number of tokens to generate.
 * @property {string} [system] - System prompt for the model.
 * @property {Message[]} messages - Messages to provide to the model.
 * @property {number} [temperature] - Amount of randomness to inject into the response.
 */

// export interface Message {
//   role: 'user' | 'assistant';
//   content: Content[];
// }

/**
 * @typedef {object} Message
 * @property {'user' | 'assistant'} role - Role of the message sender.
 * @property {Content[]} content - Content of the message.
 */
