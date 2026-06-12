import { searchProfiles, deleteProfile } from '/api.mjs';
import { defineCustomElement } from '/define-custom-element.mjs';

class ProfileDirectory extends HTMLElement {
  query = { name: '', email: '' };

  connectedCallback() {
    this.load();
    this.elements.search.addEventListener('search-change', (event) => {
      this.query = event.detail;
      this.load();
    });
    this.elements.list.addEventListener('open-profile', (event) => {
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
    this.elements.createBtn.addEventListener('click', () => {
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
    this.elements.list.items = items;
  }

  async removeProfile(id) {
    if (!window.confirm(`Delete profile "${id}"?`)) return;
    const { ok } = await deleteProfile(id);
    if (ok) this.load();
  }
}

defineCustomElement(ProfileDirectory, {
  name: 'profile-directory',
  elements: { search: 'search', list: 'list', createBtn: 'create' },
});
