import { defineCustomElement } from '/define-custom-element.mjs';

class ProfileItem extends HTMLElement {
  connectedCallback() {
    this.render();
    this.openBtn.addEventListener('click', () => {
      const event = new CustomEvent('open-profile', {
        detail: { id: this.getAttribute('profile-id') || '' },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    });
    this.deleteBtn.addEventListener('click', () => {
      const event = new CustomEvent('delete-profile', {
        detail: { id: this.getAttribute('profile-id') || '' },
        bubbles: true,
        composed: true,
      });
      this.dispatchEvent(event);
    });
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    this.elements.nameEl.textContent = this.getAttribute('display-name') || '';
    this.elements.emailEl.textContent = this.getAttribute('email') || '';
  }
}

defineCustomElement(ProfileItem, {
  name: 'profile-item',
  observedAttributes: ['display-name', 'email'],
  elements: {
    nameEl: 'name',
    emailEl: 'email',
    openBtn: 'open',
    deleteBtn: 'delete',
  },
});
