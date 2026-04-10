import { Component } from '@theme/component';

/**
 * @typedef {Object} TabbedCollectionRefs
 * @property {HTMLElement[]} tab - Tab button elements
 * @property {HTMLElement[]} panel - Tab panel elements
 * @property {HTMLElement[]} description - Description elements
 */

/** @extends {Component<TabbedCollectionRefs>} */
class TabbedCollection extends Component {
  /**
   * Handle tab click — switch active tab via client-side show/hide
   * @param {string} tabIndex - The index of the tab clicked
   * @param {Event} event - The click event
   */
  handleTabClick(tabIndex, event) {
    event.preventDefault();

    const index = parseInt(tabIndex, 10);
    const tabs = this.refs.tab;
    const panels = this.refs.panel;
    const descriptions = this.refs.description;

    if (!tabs || !panels) return;

    for (const tab of tabs) {
      const idx = parseInt(tab.dataset.tabIndex, 10);
      const isActive = idx === index;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.classList.toggle('tabbed-collection__tab--active', isActive);
    }

    for (const panel of panels) {
      const idx = parseInt(panel.dataset.tabIndex, 10);
      panel.hidden = idx !== index;
    }

    if (descriptions) {
      for (const desc of descriptions) {
        const idx = parseInt(desc.dataset.tabIndex, 10);
        desc.hidden = idx !== index;
      }
    }

    if (panels[index]) {
      panels[index].scrollLeft = 0;
    }
  }
}

if (!customElements.get('tabbed-collection')) {
  customElements.define('tabbed-collection', TabbedCollection);
}
