import { Notebook } from './notebook';
import * as monaco from 'monaco-editor';
import { setupMonacoEnvironment } from './monacoEnvironment';

setupMonacoEnvironment();

document.addEventListener('DOMContentLoaded', () => {
  new Notebook('notebook');
});
