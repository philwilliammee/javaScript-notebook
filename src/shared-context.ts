export class SharedContext {
  private context: Record<string, any>;

  constructor() {
    this.context = {};
  }

  evaluate(code: string): any {
    try {
      // Validate the code syntax before execution
      this.validateCode(code);

      // Create a function to execute code within the current context
      const executeInContext = new Function(...Object.keys(this.context), `
        "use strict";
        try {
          ${code}
        } catch (error) {
          throw new Error(error.message);
        }
      `);

      // Execute the code with the current context values as arguments
      const result = executeInContext(...Object.values(this.context));

      // Update the context with new variables defined in the code
      this.updateContext(code);

      return result;
    } catch (error: any) {
      console.error('Error during evaluation:', error);
      console.error('Code:', code);
      throw new Error(`Execution error: ${error.message}`);
    }
  }

  private validateCode(code: string): void {
    try {
      // Use Function constructor to validate syntax
      new Function(code);
    } catch (error: any) {
      throw new Error(`Syntax error in code: ${error.message}`);
    }
  }

  private updateContext(code: string): void {
    const newVars: Record<string, any> = {};

    const variableNames = this.extractVariableNames(code).join(', ');

    // Include 'console' as an additional parameter
    const varExtractor = new Function(...Object.keys(this.context), 'console', `
      "use strict";
      ${code}
      return { ${variableNames} };
    `);

    try {
      // Create a dummy console object to suppress output
      const dummyConsole = {
        log: () => {},
        // warn: () => {},
        // error: () => {},
        // info: () => {},
        // debug: () => {},
        // trace: () => {},
        // dir: () => {},
        // time: () => {},
        // timeEnd: () => {},
        // assert: () => {},
        // Add other console methods if necessary
      };

      Object.assign(newVars, varExtractor(...Object.values(this.context), dummyConsole));
    } catch (error) {
      // console.warn('Variable extraction warning:', error);
    }

    // Merge new variables into the context
    Object.assign(this.context, newVars);
  }

  extractVariableNames(code: string): string[] {
    const variablePattern = /(?:let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const functionPattern = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
    const variables = new Set<string>();

    let match;
    while ((match = variablePattern.exec(code)) !== null) {
      variables.add(match[1]);
    }
    while ((match = functionPattern.exec(code)) !== null) {
      variables.add(match[1]);
    }

    return Array.from(variables);
  }

  getContext(): Record<string, any> {
    return this.context;
  }
}
