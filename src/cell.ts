import { codeBotInstance } from "./code-bot";
import { ConsoleWrapper } from "./console-wrapper";
import { Notebook } from "./notebook";
import { MonacoEditor } from "./components/MonacoEditor";
import { ButtonSpinner } from "./components/ButtonSpinner";

export class Cell {
  private id: number;
  private notebook: Notebook;
  private codeEditor: MonacoEditor | null = null;
  private outputElement: HTMLElement | null;
  private promptInput: HTMLInputElement | null;
  private buttonSpinner: ButtonSpinner | null = null;
  element: HTMLElement;
  private isGenerating: boolean = false;

  constructor(id: number, notebook: Notebook, initialCode: string = "") {
    this.id = id;
    this.notebook = notebook;
    this.element = this.createElement();
    this.outputElement = this.element.querySelector(".output-content") as HTMLElement;
    this.promptInput = this.element.querySelector(".prompt-input") as HTMLInputElement;

    const generateButton = this.element.querySelector(".generate-btn") as HTMLButtonElement;
    this.buttonSpinner = new ButtonSpinner(generateButton);

    const editorContainer = this.element.querySelector(".monaco-editor-container") as HTMLElement;
    this.codeEditor = new MonacoEditor(
      editorContainer,
      initialCode,
      (value: string) => {
        // Handle onChange if needed
      }
    );

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
        <button class="btn btn-green generate-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 8v8"></path><path d="M8 12h8"></path></svg>
          Generate Code
        </button>
      </div>
      <div class="monaco-editor-container"></div>
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

  private setLoading(loading: boolean) {
    this.isGenerating = loading;
    const generateButton = this.element.querySelector(".generate-btn") as HTMLButtonElement;
    const executeButton = this.element.querySelector(".execute-btn") as HTMLButtonElement;

    if (loading) {
      this.buttonSpinner?.show();
      generateButton.disabled = true;
      executeButton.disabled = true;
      if (this.promptInput) this.promptInput.disabled = true;
    } else {
      this.buttonSpinner?.hide();
      generateButton.disabled = false;
      executeButton.disabled = false;
      if (this.promptInput) this.promptInput.disabled = false;
    }
  }

  private async generateCode(): Promise<void> {
    const prompt = this.promptInput?.value.trim();
    if (prompt && !this.isGenerating) {
      this.setLoading(true);
      try {
        const { code, description } = await codeBotInstance.generateCode(prompt);
        if (this.codeEditor) {
          this.codeEditor.setValue(code);
        }
        if (this.outputElement) {
          this.outputElement.textContent = `Code generated successfully:\n${description}`;
        }
      } catch (error: any) {
        if (this.outputElement) {
          this.outputElement.textContent = `Error generating code: ${error.message}`;
        }
      } finally {
        this.setLoading(false);
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
      const code = this.codeEditor?.getValue() || "";
      const result = await this.notebook.executeInContext(code);

      const consoleOutput = consoleWrapper.getLogs();

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

  public dispose() {
    if (this.codeEditor) {
      this.codeEditor.dispose();
    }
  }
}
