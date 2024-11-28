import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelCommandOutput,
} from '@aws-sdk/client-bedrock-runtime';
import {
  MODEL_IDS,
  ClaudeRequestBody,
  ClaudeResponse,
  Message,
} from './BedrockTypes';
const logger = console;

export interface BedrockOptions {
  temperature: number;
}

export class BedrockClient {
  private bedrockClient: BedrockRuntimeClient;
  private decoder: TextDecoder;

  constructor() {
    this.bedrockClient = new BedrockRuntimeClient({
      region: 'us-east-1', // get this in config?
    });
    this.decoder = new TextDecoder();
  }

  // Unified chat method that accepts model ID, messages, and options
  public async chat(
    prompt: Message[],
    systemPrompt: string,
    options: BedrockOptions
  ): Promise<string> {
    try {
      // filter the system message from the prompt;
      logger.debug(
        'bedrock.service.chat Prompt:',
        JSON.stringify(prompt, null, 2)
      );

      const requestBody: ClaudeRequestBody = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 10000, // the output is truncated causing parse errors because of the token limit.
        system: systemPrompt,
        temperature: options.temperature,
        messages: prompt,
      };
      const body = JSON.stringify(requestBody);

      const command = new InvokeModelCommand({
        modelId: MODEL_IDS.CLAUDE,
        contentType: 'application/json',
        accept: 'application/json',
        body,
      });

      const response: InvokeModelCommandOutput = await this.bedrockClient.send(
        command
      );
      const responseData = this.decoder.decode(response.body);

      // eslint-disable-next-line no-case-declarations
      const claudeResponse: ClaudeResponse = JSON.parse(responseData);
      return claudeResponse.content[0].text;
    } catch (error) {
      console.error('Error in BedrockClient:', error);
      throw new Error(
        'An error occurred while communicating with the Bedrock API.'
      );
    }
  }
}

// Export a single instance of the BedrockClient
export const bedrockClient = new BedrockClient();
