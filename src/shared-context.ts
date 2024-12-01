export class SharedContext {
  context: Object;
  constructor() {
    this.context = {};
  }

  evaluate(code: string) {
    try {
      // Create a function that will execute in the context
      const executeInContext = new Function(...Object.keys(this.context), `
        try {
          ${code}
        } catch (error) {
          throw new Error(error.message);
        }
      `);

      // Execute the code with the context variables as arguments
      const result = executeInContext(...Object.values(this.context));

      // Extract any new variables defined in the code
      const newVars = {};
      const varExtractor = new Function(...Object.keys(this.context), `
        ${code}
        return { ${this.extractVariableNames(code).join(', ')} };
      `);

      try {
        Object.assign(newVars, varExtractor(...Object.values(this.context)));
      } catch (e) {
        // If variable extraction fails, we still want to continue
        console.warn('Variable extraction warning:', e);
      }

      // Update the context with new variables
      Object.assign(this.context, newVars);

      return result;
    } catch (error: any) {
      throw new Error(`Execution error: ${error.message}`);
    }
  }

  // Extract variable names from the code and return them as an array
  extractVariableNames(code: string ): string[] {
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

  getContext() {
    return this.context;
  }
}
