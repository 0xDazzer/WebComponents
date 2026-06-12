import { buildProfileState } from '/shared/profile-domain.mjs';
import { createProfile } from '/api.mjs';
import { defineCustomElement } from '/define-custom-element.mjs';

class ProfileCreateDialog extends HTMLElement {
  state = buildProfileState({});

  connectedCallback() {
    this.elements.form.state = this.state;
    this.elements.form.editableId = true;
    this.elements.form.addEventListener('profile-state-change', (event) => {
      this.state = event.detail.state;
      this.elements.createBtn.disabled = !this.state.valid;
    });
    this.elements.cancelBtn.addEventListener('click', () => this.close());
    this.elements.createBtn.addEventListener('click', () => this.submit());
  }

  open() {
    this.state = buildProfileState({});
    this.elements.form.state = this.state;
    this.elements.createBtn.disabled = !this.state.valid;
    this.elements.dialog.showModal();
  }

  close() {
    this.elements.dialog.close();
  }

  async submit() {
    if (!this.state.valid) return;
    const result = await createProfile(this.state.profile);
    if (!result.ok) {
      this.elements.form.serverErrors = result.errors;
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

defineCustomElement(ProfileCreateDialog, {
  name: 'profile-create-dialog',
  elements: {
    dialog: 'dialog',
    form: 'form',
    cancelBtn: 'cancel',
    createBtn: 'create',
  },
});
