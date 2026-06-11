import { buildProfileState } from '/shared/profile-domain.mjs';
import { createProfile } from '/api.mjs';

const template = document.getElementById('profile-create-dialog');

class ProfileCreateDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    const content = template.content.cloneNode(true);
    this.shadowRoot.append(content);
    this.dialog = this.shadowRoot.getElementById('dialog');
    this.form = this.shadowRoot.getElementById('form');
    this.cancelBtn = this.shadowRoot.getElementById('cancel');
    this.createBtn = this.shadowRoot.getElementById('create');
    this.state = buildProfileState({});
  }

  connectedCallback() {
    this.form.state = this.state;
    this.form.editableId = true;
    this.form.addEventListener('profile-state-change', (event) => {
      this.state = event.detail.state;
      this.createBtn.disabled = !this.state.valid;
    });
    this.cancelBtn.addEventListener('click', () => this.close());
    this.createBtn.addEventListener('click', () => this.submit());
  }

  open() {
    this.state = buildProfileState({});
    this.form.state = this.state;
    this.createBtn.disabled = !this.state.valid;
    this.dialog.showModal();
  }

  close() {
    this.dialog.close();
  }

  async submit() {
    if (!this.state.valid) return;
    const result = await createProfile(this.state.profile);
    if (!result.ok) {
      this.form.serverErrors = result.errors;
      return;
    }
    this.dispatchEvent(
      new CustomEvent('profile-created', {
        detail: { id: result.profile.id },
        bubbles: true,
        composed: true,
      }),
    );
    this.close();
  }
}

customElements.define('profile-create-dialog', ProfileCreateDialog);
