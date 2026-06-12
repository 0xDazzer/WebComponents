export const defineCustomElement = (ComponentClass, metadata) => {
  const {
    name,
    elements = {},
    observedAttributes = [],
    shadow = true,
  } = metadata;
  const template = document.getElementById(name);

  class CustomElement extends ComponentClass {
    elements = {};

    static get observedAttributes() {
      return observedAttributes;
    }

    constructor() {
      super();
      if (shadow) {
        const root = this.attachShadow({ mode: 'open' });
        if (template) root.append(template.content.cloneNode(true));
        for (const [prop, id] of Object.entries(elements)) {
          this.elements[prop] = root.getElementById(id);
        }
      }
    }
  }

  customElements.define(name, CustomElement);
  return CustomElement;
};
