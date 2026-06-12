import { defineCustomElement } from '/define-custom-element.mjs';

class ProfileField extends HTMLElement {
  connectedCallback() {
    const emit = () => {
      const event = new CustomEvent('field-change', {
        detail: { name: this.fieldName, value: this.value },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    };
    this.elements.inputEl.addEventListener('input', emit);
    this.elements.textareaEl.addEventListener('input', emit);
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  get fieldName() {
    return this.getAttribute('name') || '';
  }

  get value() {
    return this.hasAttribute('multiline')
      ? this.elements.textareaEl.value
      : this.elements.inputEl.value;
  }

  render() {
    const multiline = this.hasAttribute('multiline');
    const disabled = this.hasAttribute('disabled');
    const id = `field-${this.fieldName}`;

    this.elements.inputEl.hidden = multiline;
    this.elements.textareaEl.hidden = !multiline;

    const active = multiline ? this.elements.textareaEl : this.elements.inputEl;
    this.elements.labelEl.setAttribute('for', id);
    active.id = id;
    this.elements.labelEl.textContent =
      this.getAttribute('label') || this.fieldName;

    if (!multiline) {
      this.elements.inputEl.type = this.getAttribute('type') || 'text';
    }
    active.value = this.getAttribute('value') || '';
    active.disabled = disabled;
    this.elements.errorEl.setAttribute(
      'message',
      this.getAttribute('error') || '',
    );
  }
}

defineCustomElement(ProfileField, {
  name: 'profile-field',
  observedAttributes: [
    'name',
    'label',
    'type',
    'value',
    'error',
    'multiline',
    'disabled',
  ],
  elements: {
    labelEl: 'label',
    inputEl: 'input',
    textareaEl: 'textarea',
    errorEl: 'error',
  },
});
