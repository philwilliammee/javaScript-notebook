export function setupMonacoEnvironment() {
  (self as any).MonacoEnvironment = {
    getWorkerUrl: function (moduleId: string, label: string) {
      if (label === 'typescript' || label === 'javascript') {
        return '/ts.worker.js';
      }
      return '/editor.worker.js';
    },
  };
}
