const template = document.getElementById('profile-field');

class ProfileField extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const content = template.content.cloneNode(true);
    this.shadowRoot.append(content);
    this.labelEl = this.shadowRoot.getElementById('label');
    this.inputEl = this.shadowRoot.getElementById('input');
    this.textareaEl = this.shadowRoot.getElementById('textarea');
    this.errorEl = this.shadowRoot.getElementById('error');

    const emit = () => {
      const event = new CustomEvent('field-change', {
        detail: { name: this.fieldName, value: this.value },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    };
    this.inputEl.addEventListener('input', emit);
    this.textareaEl.addEventListener('input', emit);
  }

  static get observedAttributes() {
    return ['name', 'label', 'type', 'value', 'error', 'multiline', 'disabled'];
  }

  connectedCallback() {
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
      ? this.textareaEl.value
      : this.inputEl.value;
  }

  render() {
    const multiline = this.hasAttribute('multiline');
    const disabled = this.hasAttribute('disabled');
    const id = `field-${this.fieldName}`;

    this.inputEl.hidden = multiline;
    this.textareaEl.hidden = !multiline;

    const active = multiline ? this.textareaEl : this.inputEl;
    this.labelEl.setAttribute('for', id);
    active.id = id;
    this.labelEl.textContent = this.getAttribute('label') || this.fieldName;

    if (!multiline) this.inputEl.type = this.getAttribute('type') || 'text';
    active.value = this.getAttribute('value') || '';
    active.disabled = disabled;
    this.errorEl.setAttribute('message', this.getAttribute('error') || '');
  }
}

customElements.define('profile-field', ProfileField);
