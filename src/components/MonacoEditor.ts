import * as monaco from 'monaco-editor';
// Import the worker scripts
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';


export class MonacoEditor {
    private editor: monaco.editor.IStandaloneCodeEditor | null = null;
    private container: HTMLElement;
    private value: string;
    private onChange: (value: string) => void;

    constructor(
        container: HTMLElement,
        initialValue: string = '',
        onChange: (value: string) => void
      ) {
        this.container = container;
        this.value = initialValue;
        this.onChange = onChange;

        this.initMonacoEnvironment();
        this.init();
      }

      private initMonacoEnvironment() {
        // Configure Monaco Environment to use the imported workers
        (self as any).MonacoEnvironment = {
          getWorker: function (_: any, label: string) {
            if (label === 'typescript' || label === 'javascript') {
              return new TsWorker();
            }
            return new EditorWorker();
          },
        };
      }

  private init() {
    // Configure JavaScript language defaults
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      allowJs: true,
      typeRoots: ["node_modules/@types"]
    });

    this.editor = monaco.editor.create(this.container, {
      value: this.value,
      language: 'javascript',
      theme: 'vs-light',
      automaticLayout: true,
      minimap: {
        enabled: false
      },
      scrollBeyondLastLine: false,
      fontSize: 14,
      lineNumbers: 'on',
      renderLineHighlight: 'all',
      padding: {
        top: 10,
        bottom: 10
      },
      suggest: {
        showClasses: true,
        showFunctions: true,
        showVariables: true,
        showModules: true,
        showKeywords: true
      }
    });

    this.editor.onDidChangeModelContent(() => {
      this.value = this.editor?.getValue() || '';
      this.onChange(this.value);
    });
  }

// private init() {
//     // Configure JavaScript/TypeScript defaults
//     monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
//       target: monaco.languages.typescript.ScriptTarget.ESNext,
//       module: monaco.languages.typescript.ModuleKind.ESNext,
//       allowNonTsExtensions: true,
//     });

//     // Create the Monaco Editor instance
//     this.editor = monaco.editor.create(this.container, {
//       value: this.value,
//       language: 'javascript',
//       theme: 'vs-dark',
//       automaticLayout: true,
//     });

//     this.editor.onDidChangeModelContent(() => {
//       this.value = this.editor?.getValue() || '';
//       this.onChange(this.value);
//     });
//   }


  public getValue(): string {
    return this.editor?.getValue() || this.value;
  }

  public setValue(value: string) {
    if (this.editor) {
      this.editor.setValue(value);
    }
    this.value = value;
  }

  public dispose() {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  public layout() {
    if (this.editor) {
      this.editor.layout();
    }
  }
}
