export class LoadingSpinner {
    private element: HTMLElement;

    constructor() {
      this.element = document.createElement('div');
      this.element.className = 'loading-spinner';
      this.element.innerHTML = `
        <div class="spinner"></div>
        <span>Generating code...</span>
      `;
      this.hide();
    }

    public show() {
      this.element.style.display = 'flex';
    }

    public hide() {
      this.element.style.display = 'none';
    }

    public getElement(): HTMLElement {
      return this.element;
    }
  }
