import { profileFields } from '/shared/profile-domain.mjs';

import { defineCustomElement } from '/define-custom-element.mjs';

class ProfileSummary extends HTMLElement {
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

defineCustomElement(ProfileSummary, { name: 'profile-summary' });
