import { BedrockService } from "./bedrock/bedrock.service.js";

/**
 * CodeBot class to generate JavaScript code using AWS Bedrock.
 */
export class CodeBot {
  /**
   * @param {object} config - Configuration for the BedrockService.
   * @param {string} config.region - AWS region for Bedrock.
   * @param {string} [config.endpoint] - Optional custom endpoint for Bedrock.
   */
  constructor(config) {
    console.log(config);
    this.bedrockService = new BedrockService(config);
    this.modelId = config.modelId; // AWS Bedrock model ID from Vite env.
    this.systemPrompt = `
      You are a JavaScript code assistant. All responses must be in JSON format.
      Each response must include the following keys:
      - "code": The JavaScript code as a string.
      - "description": A brief description of what the code does.

      Example response:
      {
        "code": "console.log('Hello, World!');",
        "description": "This code logs 'Hello, World!' to the console."
      }
    `;
  }

  /**
   * Generates code based on the provided user prompt.
   *
   * @param {string} userPrompt - The user's prompt for generating code.
   * @returns {Promise<{code: string, description: string}>} - Generated code and description.
   */
  async generateCode(userPrompt) {
    if (!userPrompt) {
      throw new Error("Prompt cannot be empty.");
    }

    /** @type {ClaudeRequestBody} */
    const payload = {
      anthropic_version: "bedrock-2023-05-31",
      system: this.systemPrompt,
      messages: [
        {
          role: "user",
          content: [{ text: userPrompt, type: "text" }],
        },
      ],
      max_tokens: 1000,
      temperature: 0.5,
    };

    try {
      const response = await this.bedrockService.invokeModel(
        this.modelId,
        payload
      );

      console.log(response);

      if (!response || !response.content.length) {
        throw new Error("Invalid response from Bedrock model.");
      }

      const parsedResponse = JSON.parse(response.content[0].text);

      if (!parsedResponse.code || !parsedResponse.description) {
        throw new Error(
          'Response does not include required fields: "code" and "description".'
        );
      }

      return parsedResponse;
    } catch (error) {
      console.error("Error generating code:", error);
      throw error;
    }
  }
}

// Initialize CodeBot with Vite environment variables
export const codeBotInstance = new CodeBot({
  region: import.meta.env.VITE_AWS_REGION,
  modelId: import.meta.env.VITE_BEDROCK_MODEL_ID,
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_KEY,
    sessionToken: import.meta.env.VITE_AWS_SESSION_TOKEN,
  },
});

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
