import { Cell } from './cell';
import { SharedContext } from './shared-context';

export class Notebook {
  private container: HTMLElement | null;
  private cells: Map<number, Cell>;
  private nextId: number;
  private sharedContext: SharedContext;
  private files: Map<string, any>; // Shared file store

  constructor(containerId: string) {
    this.container = document.getElementById(containerId);
    this.cells = new Map();
    this.nextId = 1;
    this.sharedContext = new SharedContext();
    this.files = new Map(); // Initialize file store

    this.setupEventListeners();
    this.addInitialCell();
  }

  private setupEventListeners(): void {
    const addCellButton = document.getElementById('addCell');
    if (addCellButton) {
      addCellButton.addEventListener('click', () => this.addCell());
    }

    const closeChartButton = document.getElementById('closeChart');
    const chartContainer = document.getElementById('myChartContainer');
    const chartElement = document.getElementById('myChart');

    if (closeChartButton && chartContainer && chartElement) {
      closeChartButton.addEventListener('click', () => {
        // Clear the chart content
        chartElement.innerHTML = "";

        // Optionally hide the container
        // chartContainer.style.display = "none";
      });
    }

    if (this.container) {
      this.container.addEventListener('cellDelete', (event: Event) => {
        const customEvent = event as CustomEvent<{ id: number }>;
        this.deleteCell(customEvent.detail.id);
      });
    }
  }

  private addInitialCell(): void {
    this.addCell("// Write your code here...");
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

  public addFileToContext(name: string, data: any): void {
    const variableName = `file_${name.replace(/[^a-zA-Z0-9]/g, '_')}`; // Safe variable name
    this.sharedContext.evaluate(`var ${variableName} = ${JSON.stringify(data)};`);
  }

  // File management methods
  public addFile(name: string, data: any): void {
    this.files.set(name, data);
  }

  public getFile(name: string): any | undefined {
    return this.files.get(name);
  }

  public listFiles(): string[] {
    return Array.from(this.files.keys());
  }
}
