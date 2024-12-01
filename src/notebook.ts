import { Cell } from './cell';
import { SharedContext } from './shared-context';

export class Notebook {
  private container: HTMLElement | null;
  private cells: Map<number, Cell>;
  private nextId: number;
  private sharedContext: SharedContext;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    this.cells = new Map();
    this.nextId = 1;
    this.sharedContext = new SharedContext();

    this.setupEventListeners();
    this.addInitialCell();
  }

  private setupEventListeners(): void {
    const addCellButton = document.getElementById('addCell');
    if (addCellButton) {
      addCellButton.addEventListener('click', () => this.addCell());
    }
    if (this.container) {
      this.container.addEventListener('cellDelete', (event: Event) => {
        const customEvent = event as CustomEvent<{ id: number }>;
        this.deleteCell(customEvent.detail.id);
      });
    }
  }

  private addInitialCell(): void {
    const initialCode = `// Example: Calculate and print Fibonacci sequence
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Calculate and print first 10 Fibonacci numbers
var fibNumbers = Array.from({ length: 10 }, (_, i) => fibonacci(i));
`;
    this.addCell(initialCode);
  }

  private addCell(initialCode: string = ''): void {
    if (this.container) {
      const cell = new Cell(this.nextId, this, initialCode);
      this.cells.set(this.nextId, cell);
      this.container.appendChild(cell.element);
      this.nextId++;
    }
  }

  private deleteCell(id: number): void {
    const cell = this.cells.get(id);
    if (cell) {
      cell.element.remove();
      this.cells.delete(id);
    }
  }

  public async executeInContext(code: string): Promise<any> {
    return this.sharedContext.evaluate(code);
  }
}
