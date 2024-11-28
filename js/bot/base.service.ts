// base/base.service.ts

// import { config } from '../../../client/app/app.config';
import { Message } from './bedrock/BedrockTypes';
import { bedrockClient } from './bedrock/bedrock.service';
// import * as mysql from 'mysql2/promise';

// Database connection setup
// const readOnlyConnection = mysql.createPool(config.mysqlReadonly);

export abstract class BaseService {
  chatContext: Message[] = [];

  // Abstract property to be defined in subclasses
  abstract SYSTEM_CONFIG_MESSAGE: string;

  /**
   * Initializes the chat context with a default assistant message.
   */
  async initializeChatContext(): Promise<void> {
    const aiResponse: StructuredResponse = {
      assistantResponse:
        'Hello! How can I assist you with querying your database tables today?',
      commands: [],
      chartConfiguration: null,
    };

    const content = JSON.stringify(aiResponse, null, 2);
    this.chatContext = [
      {
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      },
    ];
  }

  /**
   * Handles a chat interaction by sending a prompt to the assistant,
   * and processing any commands included in the assistant's response.
   */
  async handleChat(prompt: string): Promise<{
    assistantResponse: string;
    executedQueries: any[];
    chartConfiguration?: ChartConfiguration | null;
    sqlCommands: string[];
  }> {
    // Prepare messages and send the chat request
    const messages = this.prepareMessages(prompt);
    const assistantReply = await this.sendChatRequest(messages);

    // Parse the assistant's response
    let structuredResponse: StructuredResponse;
    try {
      structuredResponse = this.parseAssistantResponse(assistantReply);
    } catch (error) {
      const userMessage: Message = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'PARSE ERROR: ' + error.message,
          },
        ],
      };
      this.chatContext.push(userMessage);
      const assistantSecondReply = await this.sendChatRequest(this.chatContext);
      structuredResponse = this.parseAssistantResponse(assistantSecondReply);
    }

    const { assistantResponse, commands, chartConfiguration } =
      structuredResponse;

    // @todo validate the command

    // Execute the SQL commands
    // @todo handle sql errors?
    const executedQueries = await this.executeCommands(commands);
    const sqlCommands = commands.map((command) => command.sqlStatement);

    return {
      assistantResponse,
      executedQueries,
      chartConfiguration,
      sqlCommands,
    };
  }

  /**
   * Prepares the messages to be sent to the assistant.
   */
  private prepareMessages(prompt: string): Message[] {
    const userMessage: Message = {
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt,
          // text: encodeURI(prompt),
        },
      ],
    };

    this.chatContext.push(userMessage);
    this.truncateChatContext();
    return [...this.chatContext];
  }

  /**
   * Truncates the chat context to maintain a manageable size.
   */
  private truncateChatContext(): void {
    const MAX_MESSAGES = 5;
    if (this.chatContext.length > MAX_MESSAGES) {
      this.chatContext = this.chatContext.slice(-MAX_MESSAGES);
    }
  }

  /**
   * Sends a chat request to the assistant and returns the assistant's reply.
   */
  private async sendChatRequest(messages: Message[]): Promise<string> {
    // only send the most recent message
    // const message = messages[messages.length - 1];
    const chatResponse = await bedrockClient.chat(
      messages,
      this.SYSTEM_CONFIG_MESSAGE,
      {
        temperature: 0.6,
      }
    );

    const assistantMessage: Message = {
      role: 'assistant',
      content: [
        {
          type: 'text',
          text: chatResponse,
        },
      ],
    };

    this.chatContext.push(assistantMessage);
    return chatResponse;
  }

  /**
   * Parses the assistant's response to extract the structured response.
   * If any sanitization should be done it should happen here.
   */
  private parseAssistantResponse(response: string): StructuredResponse {
    console.log('Parsing assistant response:', response);

    // Try to parse the entire response as JSON
    let parsedResponse: StructuredResponse;
    try {
      parsedResponse = JSON.parse(response);
    } catch (error) {
      // If parsing fails, attempt to extract the JSON object from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in assistant response');
      }

      const jsonString = jsonMatch[0];

      // Parse the JSON string
      try {
        parsedResponse = JSON.parse(jsonString);
      } catch (error) {
        throw new Error(
          'Failed to parse JSON from assistant response: ' + error.message
        );
      }
    }

    return parsedResponse;
  }

  /**
   * Executes the SQL commands extracted from the assistant's response.
   */
  private async executeCommands(commands: ExtractedCommand[]): Promise<any[]> {
    if (commands.length === 0) {
      return [];
    }

    // Only run the first command
    const command = commands[0];

    console.log('Executing SQL statement:', command.sqlStatement);

    try {
      // Execute the SQL statement
      const sqlQuery = command.sqlStatement;
      // const [queryData] = []await readOnlyConnection.query(sqlQuery);
      return [sqlQuery];
    } catch (error) {
      console.error('Error executing SQL statement:', error);
      throw error; // Rethrow the error to be handled upstream
    }
  }
}

// Interface definitions
export interface ExtractedCommand {
  sqlStatement: string;
}

// Define the ChartConfiguration interface
export interface ChartConfiguration {
  type: string;
  data: {
    labelsField: string; // Field name in the query results to use for labels
    dataField: string; // Field name in the query results to use for data points
    datasets: Array<{
      label: string;
      backgroundColor?: string;
      borderColor?: string;
      fill?: boolean;
      tension?: number;
    }>;
  };
  options?: any;
}

// Update the StructuredResponse interface to include chartConfiguration
export interface StructuredResponse {
  assistantResponse: string;
  commands: ExtractedCommand[];
  chartConfiguration?: ChartConfiguration | null;
}
