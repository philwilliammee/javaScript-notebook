import { Cell } from './cell.js';
import { SharedContext } from './shared-context.js';

export class Notebook {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cells = new Map();
    this.nextId = 1;
    this.sharedContext = new SharedContext();
    
    this.setupEventListeners();
    this.addInitialCell();
  }

  setupEventListeners() {
    document.getElementById('addCell').addEventListener('click', () => this.addCell());
    this.container.addEventListener('cellDelete', (event) => {
      this.deleteCell(event.detail.id);
    });
  }

  addInitialCell() {
    const initialCode = `// Example: Calculate and print Fibonacci sequence
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate and print first 10 Fibonacci numbers
const fibNumbers = Array.from({ length: 10 }, (_, i) => fibonacci(i));
console.log("First 10 Fibonacci numbers:", fibNumbers);

// Return the Fibonacci numbers so they're available in shared context
fibNumbers;`;

    this.addCell(initialCode);
  }

  addCell(initialCode = '') {
    const cell = new Cell(this.nextId, this, initialCode);
    this.cells.set(this.nextId, cell);
    this.container.appendChild(cell.element);
    this.nextId++;
  }

  deleteCell(id) {
    const cell = this.cells.get(id);
    if (cell) {
      cell.element.remove();
      this.cells.delete(id);
    }
  }

  async executeInContext(code) {
    return this.sharedContext.evaluate(code);
  }
}