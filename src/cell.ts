import { codeBotInstance } from "./code-bot";
import { ConsoleWrapper } from "./console-wrapper";
import { Notebook } from "./notebook";

export class Cell {
  private id: number;
  private notebook: Notebook;
  private codeEditor: HTMLTextAreaElement | null;
  private outputElement: HTMLElement | null;
  private promptInput: HTMLInputElement | null;
  element: HTMLElement;

  constructor(id: number, notebook: Notebook, initialCode: string = "") {
    this.id = id;
    this.notebook = notebook;
    this.element = this.createElement();
    this.codeEditor = this.element.querySelector(".code-editor") as HTMLTextAreaElement;
    this.outputElement = this.element.querySelector(".output-content") as HTMLElement;
    this.promptInput = this.element.querySelector(".prompt-input") as HTMLInputElement;

    if (initialCode) {
      this.codeEditor.value = initialCode;
    }

    this.setupEventListeners();
  }

  private createElement(): HTMLElement {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.innerHTML = `
      <div class="cell-header">
        <span class="cell-id">Cell #${this.id}</span>
        <button class="delete-btn">Delete</button>
      </div>
      <div class="prompt-section">
        <input type="text" class="prompt-input" placeholder="Enter your prompt for Code-Bot..." value="Calculate and print Fibonacci sequence">
        <button class="btn btn-green generate-btn">Generate Code</button>
      </div>
      <textarea class="code-editor" placeholder="Enter your JavaScript code here..."></textarea>
      <button class="btn btn-blue execute-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
        Execute
      </button>
      <div class="output">
        <div class="output-label">Output:</div>
        <pre class="output-content"></pre>
      </div>
    `;
    return cell;
  }

  private setupEventListeners(): void {
    const executeButton = this.element.querySelector(".execute-btn") as HTMLButtonElement;
    executeButton.addEventListener("click", () => this.executeCode());

    const generateButton = this.element.querySelector(".generate-btn") as HTMLButtonElement;
    generateButton.addEventListener("click", () => this.generateCode());

    const deleteButton = this.element.querySelector(".delete-btn") as HTMLButtonElement;
    deleteButton.addEventListener("click", () => {
      this.element.dispatchEvent(
        new CustomEvent("cellDelete", {
          bubbles: true,
          detail: { id: this.id },
        })
      );
    });
  }

  private async generateCode(): Promise<void> {
    const prompt = this.promptInput?.value.trim();
    if (prompt) {
      const {
        VITE_AWS_REGION,
        VITE_BEDROCK_MODEL_ID,
        VITE_AWS_ACCESS_KEY,
        VITE_AWS_SECRET_KEY,
      } = import.meta.env;

      const config = {
        region: VITE_AWS_REGION,
        credentials: {
          accessKeyId: VITE_AWS_ACCESS_KEY,
          secretAccessKey: VITE_AWS_SECRET_KEY,
        },
      };

      const codeBot = codeBotInstance;
      try {
        const { code, description } = await codeBot.generateCode(prompt);
        if (this.codeEditor) {
          this.codeEditor.value = code;
        }
        if (this.outputElement) {
          this.outputElement.textContent = `Code generated successfully:\n${description}`;
        }
      } catch (error: any) {
        if (this.outputElement) {
          this.outputElement.textContent = `Error generating code: ${error.message}`;
        }
      }
    }
  }

  private formatOutput(value: any): string {
    if (value === undefined) return "undefined";
    if (value === null) return "null";
    if (typeof value === "function") return value.toString();
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  }

  private async executeCode(): Promise<void> {
    const consoleWrapper = new ConsoleWrapper();
    try {
      const code = this.codeEditor?.value || "";
      const result = await this.notebook.executeInContext(code);

      // Get console output
      const consoleOutput = consoleWrapper.getLogs();

      // Format the final output
      let output = "";
      if (consoleOutput) {
        output += consoleOutput;
      }
      if (result !== undefined) {
        if (output) output += "\n\n";
        output += `Return value: ${this.formatOutput(result)}`;
      }

      if (this.outputElement) {
        this.outputElement.textContent = output || "No output";
      }
    } catch (error: any) {
      if (this.outputElement) {
        this.outputElement.textContent = `Error: ${error.message}`;
      }
    } finally {
      consoleWrapper.restore();
    }
  }
}
