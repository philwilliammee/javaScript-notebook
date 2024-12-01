export class ConsoleWrapper {
  private logs: string[];
  private static originalConsole: { [key: string]: (...args: any[]) => void } = {};
  private static isOverridden: boolean = false;

  constructor() {
    this.logs = [];
    if (!ConsoleWrapper.isOverridden) {
      console.info('ConsoleWrapper: Overriding console methods this is mostly for errors and warnings');
      this.setupConsoleOverrides();
      ConsoleWrapper.isOverridden = true;
    }
  }

  clear(): void {
    this.logs = [];
  }

  getLogs(): string {
    return this.logs.join('\n');
  }

  private setupConsoleOverrides(): void {
    const methods: Array<keyof Console> = ['log', 'info', 'warn', 'error'];

    methods.forEach((method) => {
      // Save the original console method only once
      if (!ConsoleWrapper.originalConsole[method]) {
        ConsoleWrapper.originalConsole[method] = console[method].bind(console);
      }

      // Override the console method
      console[method] = (...args: any[]) => {
        // Format and store the log
        const formattedArgs = args.map((arg) => {
          if (typeof arg === 'object') {
            return JSON.stringify(arg, null, 2);
          }
          return String(arg);
        });

        this.logs.push(formattedArgs.join(' '));

        // Optionally, call the original console method if needed
        // Uncomment the next line if you want logs in the browser console as well
        // ConsoleWrapper.originalConsole[method].apply(console, args);
      };
    });
  }

  restore(): void {
    const methods: Array<keyof Console> = ['log', 'info', 'warn', 'error'];
    methods.forEach((method) => {
      if (ConsoleWrapper.originalConsole[method]) {
        console[method] = ConsoleWrapper.originalConsole[method];
      }
    });
    ConsoleWrapper.isOverridden = false;
  }
}
