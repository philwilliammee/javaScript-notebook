const {
  BedrockRuntimeClient,
  InvokeModelCommand,
} = require("@aws-sdk/client-bedrock-runtime");

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
   * @param {object} body - Payload to send to the model.
   * @returns {Promise<object>} - Response from the model.
   */
  async invokeModel(modelId, body) {
    const command = new InvokeModelCommand({
      modelId,
      body: JSON.stringify(body),
      contentType: "application/json",
      accept: "application/json",
    });

    try {
      const response = await this.client.send(command);
      return JSON.parse(new TextDecoder("utf-8").decode(response.body));
    } catch (error) {
      console.error("Error invoking model:", error);
      throw error;
    }
  }
}

module.exports = BedrockService;

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
