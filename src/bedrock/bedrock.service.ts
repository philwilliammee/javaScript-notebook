import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

class BedrockService {
  private client: BedrockRuntimeClient;

  constructor(config: BedrockServiceConfig) {
    this.client = new BedrockRuntimeClient(config);
  }

  async invokeModel(modelId: string, body: ClaudeRequestBody): Promise<BedrockResponse > {
    console.log("Invoking model:", modelId, body);
    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    try {
      const response = await this.client.send(command);
      return JSON.parse(new TextDecoder("utf-8").decode(response.body)) as BedrockResponse ;
    } catch (error) {
      console.error("Error invoking model:", error);
      throw error;
    }
  }
}

export { BedrockService };


// Define the main type for the response object
export interface BedrockResponse {
  id: string; // Unique identifier for the message
  type: string; // Type of the message
  role: string; // Role of the message sender (e.g., "assistant")
  model: string; // Model used to generate the response
  content: Content[]; // Array of content objects
  stop_reason: string; // Reason for stopping the generation
  stop_sequence: string | null; // Stop sequence used
  usage: Usage; // Token usage details
}

// Define the type for token usage
export interface Usage {
  input_tokens: number; // Number of tokens in the input
  output_tokens: number; // Number of tokens in the output
}


export interface BedrockServiceConfig {
  region: string;
  endpoint?: string;
}

export interface ClaudeRequestBody {
  anthropic_version: string;
  max_tokens: number;
  system?: string;
  messages: Message[];
  temperature?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: Content[];
}

export interface Content {
  type: string; // Type of content (e.g., "text")
  text: string; // Actual content text (usually a JSON string)
}

export interface BedRockConfig {
  region: string;
  modelId: string;
  credentials: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string;
  };
}
