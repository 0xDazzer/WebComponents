import { defineCustomElement } from '/define-custom-element.mjs';

class ValidationMessage extends HTMLElement {
  attributeChangedCallback() {
    this.render();
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.elements.textEl.textContent = this.getAttribute('message') || '';
  }
}

defineCustomElement(ValidationMessage, {
  name: 'validation-message',
  observedAttributes: ['message'],
  elements: { textEl: 'text' },
});
