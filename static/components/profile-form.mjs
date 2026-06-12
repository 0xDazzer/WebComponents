import { profileFields, buildProfileState } from '/shared/profile-domain.mjs';
import { saveProfile, createProfile } from '/api.mjs';
import { defineCustomElement } from '/define-custom-element.mjs';

class ProfileForm extends HTMLElement {
  fieldEls = new Map();
  _state = buildProfileState({});
  _serverErrors = {};
  _editableId = false;

  connectedCallback() {
    this.renderFields();
    this.elements.formEl.addEventListener('submit', (event) => {
      event.preventDefault();
      this.handleSave();
    });
    this.elements.formEl.addEventListener('field-change', (event) => {
      this.updateField(event.detail.name, event.detail.value);
    });
    this.render();
  }

  set state(value) {
    this._state = value;
    this._serverErrors = {};
    this.render();
  }

  get state() {
    return this._state;
  }

  set serverErrors(value) {
    this._serverErrors = value || {};
    this.render();
  }

  set editableId(value) {
    this._editableId = Boolean(value);
    this.render();
  }

  get isCreate() {
    return this.getAttribute('mode') === 'create';
  }

  renderFields() {
    const nodes = [];
    for (const [name, metadata] of Object.entries(profileFields)) {
      if (metadata.computed) continue;
      const field = document.createElement('profile-field');
      field.setAttribute('name', name);
      let label = name;
      if (metadata.label) label = metadata.label;
      field.setAttribute('label', label);

      let type = 'text';
      if (metadata.inputType) {
        type = metadata.inputType;
      } else if (metadata.type === 'number' || metadata.type === 'integer') {
        type = 'number';
      }
      field.setAttribute('type', type);
      if (metadata.multiline) field.setAttribute('multiline', '');
      this.fieldEls.set(name, field);
      nodes.push(field);
    }
    this.elements.fieldsEl.replaceChildren(...nodes);
  }

  updateField(name, value) {
    const next = { ...this.state.profile };
    if (name === 'secondarySkills') {
      next[name] = value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (
      profileFields[name]?.type === 'number' ||
      profileFields[name]?.type === 'integer'
    ) {
      next[name] = value === '' ? 0 : Number(value);
    } else {
      next[name] = value;
    }

    this._state = buildProfileState(next);
    this._serverErrors = {};
    this.dispatchEvent(
      new CustomEvent('profile-state-change', {
        detail: { state: this._state },
        bubbles: true,
        composed: true,
      }),
    );
    this.render();
  }

  async handleSave() {
    if (!this.state.valid) return;
    const username = this.state.profile.id;

    if (this.isCreate) {
      const result = await createProfile(this.state.profile);
      if (!result.ok) {
        this.serverErrors = result.errors;
        return;
      }
      this.dispatchEvent(
        new CustomEvent('profile-created', {
          detail: { id: result.profile.id },
          bubbles: true,
          composed: true,
        }),
      );
      return;
    }

    const result = await saveProfile(username, this.state.profile);
    if (!result.ok) {
      this.serverErrors = result.errors;
      this.elements.statusEl.textContent = '';
      return;
    }
    this._state = result;
    this.elements.statusEl.textContent = 'Saved';
    setTimeout(() => {
      if (this.elements.statusEl.textContent === 'Saved') {
        this.elements.statusEl.textContent = '';
      }
    }, 1500);
    this.dispatchEvent(
      new CustomEvent('profile-saved', {
        detail: { state: this._state },
        bubbles: true,
        composed: true,
      }),
    );
    this.render();
  }

  render() {
    if (!this.isConnected) return;
    const profile = this.state?.profile || {};
    const errors = { ...this.state?.errors, ...this._serverErrors };

    let title = 'Profile';
    if (this.isCreate) title = 'Create Profile';
    else if (profile.id) title = `Edit: ${profile.id}`;
    this.elements.titleEl.textContent = title;

    this.elements.saveBtn.textContent = this.isCreate ? 'Create' : 'Save';
    this.elements.saveBtn.disabled = !this.state.valid;

    for (const [name, metadata] of Object.entries(profileFields)) {
      if (metadata.computed) continue;
      const field = this.fieldEls.get(name);
      if (!field) continue;
      const raw = profile[name];
      let display;
      if (name === 'secondarySkills') {
        display = Array.isArray(raw) ? raw.join(', ') : '';
      } else {
        display = raw === null || raw === undefined ? '' : String(raw);
      }
      field.setAttribute('value', display);
      field.setAttribute('error', errors[name] || '');
      if (name === 'id' && !this._editableId) {
        field.setAttribute('disabled', '');
      } else {
        field.removeAttribute('disabled');
      }
    }

    this.elements.summaryEl.data = this.state.computed || {};
  }
}

defineCustomElement(ProfileForm, {
  name: 'profile-form',
  elements: {
    formEl: 'form',
    titleEl: 'title',
    fieldsEl: 'fields',
    summaryEl: 'summary',
    saveBtn: 'save',
    statusEl: 'status',
  },
});
