const template = document.getElementById('profile-item');

class ProfileItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const content = template.content.cloneNode(true);
    this.shadowRoot.append(content);
    this.nameEl = this.shadowRoot.getElementById('name');
    this.emailEl = this.shadowRoot.getElementById('email');
    this.openBtn = this.shadowRoot.getElementById('open');
    this.deleteBtn = this.shadowRoot.getElementById('delete');
  }

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

  static get observedAttributes() {
    return ['display-name', 'email'];
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    this.nameEl.textContent = this.getAttribute('display-name') || '';
    this.emailEl.textContent = this.getAttribute('email') || '';
  }
}

customElements.define('profile-item', ProfileItem);
