const template = document.getElementById('profile-search');

class ProfileSearch extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const content = template.content.cloneNode(true);
    this.shadowRoot.append(content);
    this.nameInput = this.shadowRoot.getElementById('name');
    this.emailInput = this.shadowRoot.getElementById('email');
    this.timer = null;
  }

  connectedCallback() {
    const emit = () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        const event = new CustomEvent('search-change', {
          detail: {
            name: this.nameInput.value,
            email: this.emailInput.value,
          },
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(event);
      }, 250);
    };
    this.nameInput.addEventListener('input', emit);
    this.emailInput.addEventListener('input', emit);
  }
}

customElements.define('profile-search', ProfileSearch);
