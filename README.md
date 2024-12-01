# JavaScript Notebook Editor

This project is a notebook-style web-based editor for writing, executing, and sharing JavaScript code. It allows users to:
1. Write and edit JavaScript code in individual "cells."
2. Execute code with shared context across all cells.
3. Generate code snippets via a bot.
4. Capture and display console outputs within each cell.

---

## **Features**
1. **Dynamic Cells**:
   - Each cell acts as an independent code editor with execution and output display capabilities.
   - Supports addition, deletion, and execution of cells.

2. **Code Generation**:
   - Uses a prompt-based `CodeBot` to generate code snippets dynamically.

3. **Shared Context**:
   - Cells share a common execution context, allowing code in one cell to access variables and functions defined in another.

4. **Console Output Capture**:
   - Captures `console.log`, `console.error`, and other console outputs during code execution and displays them in the cell output section.

---

## **Implementation Details**
### **Project Structure**
- **`cell.js`**:
  - Defines the `Cell` class, which represents an individual notebook cell. Each cell:
    - Has a code editor (`<textarea>`), a prompt input, and execution functionality.
    - Displays the output or any error from code execution.
    - Supports event listeners for execution, code generation, and deletion.
- **`code-bot.js`**:
  - Implements a mock `CodeBot` class for generating code snippets based on prompts.
- **`console-wrapper.js`**:
  - Overrides console methods (`log`, `info`, `warn`, `error`) to capture logs during code execution and restores them afterward.
- **`main.js`**:
  - Initializes the notebook by creating the main `Notebook` instance.
- **`notebook.js`**:
  - Defines the `Notebook` class to manage multiple cells.
  - Handles shared execution context and cell operations (add, delete, execute).
- **`shared-context.js`**:
  - Implements a `SharedContext` class for evaluating code in a shared environment.
  - Updates context variables dynamically after code execution.

---

## **Significant Data Structures**

### **1. Cell**
Represents a single code cell in the notebook.

```typescript
interface Cell {
  id: number;                      // Unique identifier for the cell.
  notebook: Notebook;              // Reference to the parent notebook instance.
  element: HTMLDivElement;         // DOM element representing the cell.
  codeEditor: HTMLTextAreaElement; // Textarea for JavaScript code input.
  outputElement: HTMLElement;      // Output display section.
  promptInput: HTMLInputElement;   // Input for prompts to the code bot.
}
```

### **2. Notebook**
Manages all cells in the editor.
```typescript
interface Notebook {
  container: HTMLElement;          // DOM container for the notebook.
  cells: Map<number, Cell>;        // Collection of cells mapped by ID.
  nextId: number;                  // ID to be assigned to the next cell.
  sharedContext: SharedContext;    // Shared context for executing cell code.
}

### **3. SharedContext**
interface SharedContext {
  context: Record<string, any>;    // Key-value storage for shared variables and functions.

  evaluate(code: string): any;     // Executes a string of JavaScript code in the shared context.
}

```

example prompts:

Solve and chart the equation: x² + 5x - 6 = 0

generate an example "function" chart with a height of 400.
