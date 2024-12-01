import { BedRockConfig, BedrockService, ClaudeRequestBody, Message } from "./bedrock/bedrock.service";

export class CodeBot {
  private bedrockService: BedrockService;
  private modelId: string;
  private systemPrompt: string;

  constructor(config: BedRockConfig) {
    this.bedrockService = new BedrockService(config);
    this.modelId = config.modelId; // AWS Bedrock model ID from Vite env.
    this.systemPrompt = `
      You are a JavaScript code assistant. All responses must be in JSON format.
      Each response must include the following keys:
      - "code": The JavaScript code as a string.
      - "description": A brief description of what the code does.

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
