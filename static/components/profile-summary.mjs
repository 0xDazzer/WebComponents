import { profileFields } from '/shared/profile-domain.mjs';

const template = document.getElementById('profile-summary');

class ProfileSummary extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const content = template.content.cloneNode(true);
    this.shadowRoot.append(content);
  }

  set data(value) {
    this._data = value || {};
    this.render();
  }

  connectedCallback() {
    if (Object.prototype.hasOwnProperty.call(this, 'data')) {
      const value = this.data;
      delete this.data;
      this.data = value;
    }
    this.render();
  }

  render() {
    const data = this._data || {};
    for (const [key, metadata] of Object.entries(profileFields)) {
      if (!metadata.computed) continue;
      const el = this.shadowRoot.getElementById(key);
      if (!el) continue;
      el.textContent = String(data[key] ?? '-');
    }
  }
}

customElements.define('profile-summary', ProfileSummary);
