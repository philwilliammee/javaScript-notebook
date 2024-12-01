import { BedrockService } from "./bedrock/bedrock.service";

/**
 * CodeBot class to generate JavaScript code using AWS Bedrock.
 */
export class CodeBot {
  private bedrockService: BedrockService;
  private modelId: string;
  private systemPrompt: string;

  constructor(config: BedRockConfig) {
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

  async generateCode(userPrompt: string): Promise<{ code: string; description: string }> {
    if (!userPrompt) {
      throw new Error("Prompt cannot be empty.");
    }

    const payload: ClaudeRequestBody = {
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
      const response = await this.bedrockService.invokeModel(this.modelId, payload);

      console.log(response);

      if (!response || !response.content.length) {
        throw new Error("Invalid response from Bedrock model.");
      }

      const parsedResponse = JSON.parse(response.content[0].text);

      if (!parsedResponse.code || !parsedResponse.description) {
        throw new Error('Response does not include required fields: "code" and "description".');
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


interface ClaudeRequestBody {
  anthropic_version: string;
  max_tokens: number;
  system?: string;
  messages: Message[];
  temperature?: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: Content[];
}

interface Content {
  text: string;
  type: string;
}


interface BedRockConfig {
  region: string;
  modelId: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  };
}
