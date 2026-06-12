import { defineCustomElement } from '/define-custom-element.mjs';

class ProfileSearch extends HTMLElement {
  timer = null;

  connectedCallback() {
    const emit = () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        const event = new CustomEvent('search-change', {
          detail: {
            name: this.elements.nameInput.value,
            email: this.elements.emailInput.value,
          },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      }, 250);
    };
    this.elements.nameInput.addEventListener('input', emit);
    this.elements.emailInput.addEventListener('input', emit);
  }
}

defineCustomElement(ProfileSearch, {
  name: 'profile-search',
  elements: { nameInput: 'name', emailInput: 'email' },
});
