import { getProfile } from '/api.mjs';
import { buildProfileState } from '/shared/profile-domain.mjs';
import { defineCustomElement } from '/define-custom-element.mjs';

class ProfileApp extends HTMLElement {
  connectedCallback() {
    this.elements.homeLink.addEventListener('click', (event) => {
      event.preventDefault();
      window.navigation.navigate('/');
    });

    this.shadowRoot.addEventListener('navigate-profile', (event) => {
      window.navigation.navigate(event.detail.path);
    });

    window.navigation.addEventListener('navigate', (event) => {
      const url = new URL(event.destination.url);
      if (url.origin !== window.location.origin) return;
      event.intercept({
        handler: async () => {
          this.renderRoute(url.pathname);
        },
      });
    });

    this.renderRoute(window.location.pathname);
  }

  async renderRoute(pathname) {
    this.elements.main.replaceChildren();

    if (pathname === '/') {
      this.elements.main.append(document.createElement('profile-directory'));
      return;
    }

    if (pathname === '/new') {
      this.renderCreate();
      return;
    }

    if (pathname.startsWith('/profile/')) {
      const username = pathname.slice('/profile/'.length);
      await this.renderProfile(username);
      return;
    }

    const error = document.createElement('div');
    error.className = 'error';
    error.textContent = 'Route not found';
    this.elements.main.append(error);
  }

  renderCreate() {
    const form = document.createElement('profile-form');
    form.setAttribute('mode', 'create');
    form.editableId = true;
    form.state = buildProfileState({});
    form.addEventListener('profile-created', (event) => {
      window.navigation.navigate(`/profile/${event.detail.id}`);
    });
    this.elements.main.replaceChildren(form);
  }

  async renderProfile(username) {
    const result = await getProfile(username);
    if (!result.ok) {
      const error = document.createElement('div');
      error.className = 'error';
      error.textContent = 'Profile not found';
      this.elements.main.append(error);
      return;
    }
    const form = document.createElement('profile-form');
    form.state = result;
    this.elements.main.append(form);
  }
}

defineCustomElement(ProfileApp, {
  name: 'profile-app',
  elements: { main: 'main', homeLink: 'homeLink' },
});
