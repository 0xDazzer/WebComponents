import { searchProfiles, deleteProfile } from '/api.mjs';

const template = document.getElementById('profile-directory');

class ProfileDirectory extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const content = template.content.cloneNode(true);
    this.shadowRoot.append(content);
    this.search = this.shadowRoot.getElementById('search');
    this.list = this.shadowRoot.getElementById('list');
    this.createBtn = this.shadowRoot.getElementById('create');
    this.query = { name: '', email: '' };
  }

  connectedCallback() {
    this.load();
    this.search.addEventListener('search-change', (event) => {
      this.query = event.detail;
      this.load();
    });
    this.list.addEventListener('open-profile', (event) => {
      this.dispatchEvent(
        new CustomEvent('navigate-profile', {
          detail: { path: `/profile/${event.detail.id}` },
          bubbles: true,
          composed: true,
        }),
      );
    });
    this.list.addEventListener('delete-profile', (event) => {
      this.removeProfile(event.detail.id);
    });
    this.createBtn.addEventListener('click', () => {
      this.dispatchEvent(
        new CustomEvent('navigate-profile', {
          detail: { path: '/new' },
          bubbles: true,
          composed: true,
        }),
      );
    });
  }

  async load() {
    const { items } = await searchProfiles(this.query);
    this.list.items = items;
  }

  async removeProfile(id) {
    if (!window.confirm(`Delete profile "${id}"?`)) return;
    const { ok } = await deleteProfile(id);
    if (ok) this.load();
  }
}

customElements.define('profile-directory', ProfileDirectory);
