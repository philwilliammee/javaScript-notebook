export class ConsoleWrapper {
  constructor() {
    this.logs = [];
    this.setupConsoleOverrides();
  }

  clear() {
    this.logs = [];
  }

  getLogs() {
    return this.logs.join('\n');
  }

  setupConsoleOverrides() {
    const methods = ['log', 'info', 'warn', 'error'];
    this.originalConsole = {};

    methods.forEach(method => {
      this.originalConsole[method] = console[method];
      console[method] = (...args) => {
        // Call original console method
        this.originalConsole[method].apply(console, args);
        
        // Format and store the log
        const formattedArgs = args.map(arg => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
          }
          return String(arg);
        });
        
        this.logs.push(formattedArgs.join(' '));
      };
    });
  }

  restore() {
    Object.keys(this.originalConsole).forEach(method => {
      console[method] = this.originalConsole[method];
    });
  }
}