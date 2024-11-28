import { ConsoleWrapper } from './console-wrapper.js';

export class Cell {
  constructor(id, notebook, initialCode = '') {
    this.id = id;
    this.notebook = notebook;
    this.element = this.createElement();
    this.codeEditor = this.element.querySelector('.code-editor');
    this.outputElement = this.element.querySelector('.output-content');
    this.promptInput = this.element.querySelector('.prompt-input');
    
    if (initialCode) {
      this.codeEditor.value = initialCode;
    }
    
    this.setupEventListeners();
  }

  createElement() {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.innerHTML = `
      <div class="cell-header">
        <span class="cell-id">Cell #${this.id}</span>
        <button class="delete-btn">Delete</button>
      </div>
      <div class="prompt-section">
        <input type="text" class="prompt-input" placeholder="Enter your prompt for Code-Bot...">
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

  setupEventListeners() {
    const executeButton = this.element.querySelector('.execute-btn');
    executeButton.addEventListener('click', () => this.executeCode());

    const generateButton = this.element.querySelector('.generate-btn');
    generateButton.addEventListener('click', () => this.generateCode());

    const deleteButton = this.element.querySelector('.delete-btn');
    deleteButton.addEventListener('click', () => {
      this.element.dispatchEvent(new CustomEvent('cellDelete', {
        bubbles: true,
        detail: { id: this.id }
      }));
    });
  }

  async generateCode() {
    const prompt = this.promptInput.value.trim();
    if (prompt) {
      const codeBot = new (await import('./code-bot.js')).CodeBot();
      const generatedCode = codeBot.generateCode(prompt);
      this.codeEditor.value = generatedCode;
    }
  }

  formatOutput(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'function') return value.toString();
    try {
      return JSON.stringify(value, null, 2);
    } catch (error) {
      return String(value);
    }
  }

  async executeCode() {
    const consoleWrapper = new ConsoleWrapper();
    try {
      const code = this.codeEditor.value;
      const result = await this.notebook.executeInContext(code);
      
      // Get console output
      const consoleOutput = consoleWrapper.getLogs();
      
      // Format the final output
      let output = '';
      if (consoleOutput) {
        output += consoleOutput;
      }
      if (result !== undefined) {
        if (output) output += '\n\n';
        output += `Return value: ${this.formatOutput(result)}`;
      }
      
      this.outputElement.textContent = output || 'No output';
    } catch (error) {
      this.outputElement.textContent = `Error: ${error.message}`;
    } finally {
      consoleWrapper.restore();
    }
  }
}