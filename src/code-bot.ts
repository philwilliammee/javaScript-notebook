import {
  BedRockConfig,
  BedrockService,
  ClaudeRequestBody,
  Message,
} from "./bedrock/bedrock.service";

export class CodeBot {
  private bedrockService: BedrockService;
  private modelId: string;
  private systemPrompt: string;
  private chatContext: Message[] = []; // Chat context to hold message history
  private static MAX_MESSAGES = 10; // Max number of messages to retain in the context

  constructor(config: BedRockConfig) {
    this.bedrockService = new BedrockService(config);
    this.modelId = config.modelId; // AWS Bedrock model ID from Vite env.
    this.systemPrompt = `
      You are a JavaScript code assistant. Output in JSON format with keys "code" (The JavaScript code as a string) and "description" ( A brief description of what the code does.).

      Optional Feature: If the user requests a chart, generate code that uses the Google Charts library to create and display the specified chart. Ensure the code:
      - Dynamically appends the chart to a div with a specific ID (e.g., 'myChart'), do not set width to this chart as it is set to 100% of its parent container by default.
      - Includes sample data and configuration.

      Example response for a non-chart request:
      {
        "code": "console.log('Hello, World!');",
        "description": "This code logs 'Hello, World!' to the console."
      }

      Example response for a chart request:
      {
        "code": "google.charts.load('current', {packages:['corechart']});\\ngoogle.charts.setOnLoadCallback(() => {\\n  const data = google.visualization.arrayToDataTable([\\n    ['Task', 'Hours per Day'],\\n    ['Work', 8],\\n    ['Eat', 2],\\n    ['Commute', 1],\\n    ['Watch TV', 3],\\n    ['Sleep', 7]\\n  ]);\\n  const options = { title: 'Daily Activities' };\\n  const chart = new google.visualization.PieChart(document.getElementById('myChart'));\\n  chart.draw(data, options);\\n});",
        "description": "This code creates a Pie Chart using Google Charts to visualize daily activities."
      }

      Remember:
      - The response must be parsable JSON make sure to escape special characters.
      - When possible use arrow functions, and other modern JavaScript features.
    `;
  }

  /**
   * Generates code based on user input and stores chat history.
   */
  async generateCode(userPrompt: string): Promise<{ code: string; description: string }> {
    if (!userPrompt) {
      throw new Error("Prompt cannot be empty.");
    }

    // Add the user message to the chat context
    this.addToChatContext({
      role: "user",
      content: [{ text: userPrompt, type: "text" }],
    });

    // Prepare the payload
    const payload: ClaudeRequestBody = {
      anthropic_version: "bedrock-2023-05-31",
      system: this.systemPrompt,
      messages: this.chatContext, // Include the full chat context
      max_tokens: 1000,
      temperature: 0.5,
    };

    try {
      // Send the request
      const response = await this.bedrockService.invokeModel(this.modelId, payload);

      if (!response || !response.content.length) {
        throw new Error("Invalid response from Bedrock model.");
      }

      // Parse the response
      const parsedResponse = this.parseAssistantResponse(response.content[0].text);

      // Add the assistant's message to the chat context
      this.addToChatContext({
        role: "assistant",
        content: [{ text: response.content[0].text, type: "text" }],
      });

      return parsedResponse;
    } catch (error) {
      console.error("Error generating code:", error);
      throw error;
    }
  }

  /**
   * Adds a message to the chat context and truncates if necessary.
   */
  addToChatContext(message: Message): void {
    this.chatContext.push(message);

    // Truncate the context to the maximum allowed size
    if (this.chatContext.length > CodeBot.MAX_MESSAGES) {
      this.chatContext = this.chatContext.slice(-CodeBot.MAX_MESSAGES);
    }
  }

  /**
   * Parses the assistant's response to ensure it includes valid "code" and "description".
   */
  private parseAssistantResponse(responseText: string): { code: string; description: string } {
    console.log("Parsing assistant response:", responseText);

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (error: any) {
      throw new Error("Failed to parse assistant response as JSON: " + error.message);
    }

    if (!parsedResponse.code || !parsedResponse.description) {
      throw new Error('Response does not include required fields: "code" and "description".');
    }

    return parsedResponse;
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
