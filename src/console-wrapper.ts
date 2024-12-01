export class ConsoleWrapper {
  private logs: string[];
  private originalConsole: { [key: string]: (...args: any[]) => void };

  constructor() {
    this.logs = [];
    this.originalConsole = {};
    this.setupConsoleOverrides();
  }

  clear(): void {
    this.logs = [];
  }

  getLogs(): string {
    return this.logs.join('\n');
  }

  private setupConsoleOverrides(): void {
    const methods: Array<keyof Console> = ['log', 'info', 'warn', 'error'];

    methods.forEach(method => {
      this.originalConsole[method] = console[method].bind(console);
      console[method] = (...args: any[]) => {
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

  restore(): void {
    Object.keys(this.originalConsole).forEach(method => {
      console[method as keyof Console] = this.originalConsole[method];
    });
  }
}
