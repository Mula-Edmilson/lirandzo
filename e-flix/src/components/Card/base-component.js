// components/base-component.js
export class BaseComponent extends HTMLElement {
  constructor() {
    super();
    this._state = {};
    this._shadow = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  disconnectedCallback() {
    this.cleanupEventListeners();
  }

  setState(newState) {
    this._state = { ...this._state, ...newState };
    this.render();
  }

  render() {
    // To be implemented by child components
  }

  setupEventListeners() {
    // To be implemented by child components
  }

  cleanupEventListeners() {
    // To be implemented by child components
  }

  dispatch(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, {
      bubbles: true,
      composed: true,
      detail
    }));
  }
}