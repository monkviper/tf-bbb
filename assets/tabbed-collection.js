import { Component } from '@theme/component';

/**
 * @typedef {Object} TabbedCollectionRefs
 * @property {HTMLElement[]} tab - Tab buttons
 */

/** @extends {Component<TabbedCollectionRefs>} */
class TabbedCollection extends Component {
  connectedCallback() {
    super.connectedCallback();
  }

  /**
   * Handles tab click — switches active tab panel and description
   * @param {Event} event
   */
  handleTabClick(event) {
    event.preventDefault();

    const clickedTab = event.currentTarget;
    const tabIndex = clickedTab.dataset.tabIndex;

    if (clickedTab.getAttribute('aria-selected') === 'true') return;

    this.#updateTabs(clickedTab);
    this.#updatePanels(tabIndex);
    this.#updateDescriptions(tabIndex);
    this.#scrollProductsToStart(tabIndex);
  }

  /**
   * Updates active/inactive tab styles
   * @param {HTMLElement} activeTab
   */
  #updateTabs(activeTab) {
    const tabs = this.querySelectorAll('.tc-tab');

    for (const tab of tabs) {
      tab.classList.remove('tc-tab--active');
      tab.setAttribute('aria-selected', 'false');
    }

    activeTab.classList.add('tc-tab--active');
    activeTab.setAttribute('aria-selected', 'true');
  }

  /**
   * Shows the active panel, hides others
   * @param {string} tabIndex
   */
  #updatePanels(tabIndex) {
    const panels = this.querySelectorAll('[data-tab-panel]');

    for (const panel of panels) {
      if (panel.dataset.tabPanel === tabIndex) {
        panel.classList.remove('tc-products--hidden');
      } else {
        panel.classList.add('tc-products--hidden');
      }
    }
  }

  /**
   * Shows the active description, hides others
   * @param {string} tabIndex
   */
  #updateDescriptions(tabIndex) {
    const descriptions = this.querySelectorAll('[data-tab-description]');

    for (const desc of descriptions) {
      if (desc.dataset.tabDescription === tabIndex) {
        desc.classList.remove('tc-description--hidden');
      } else {
        desc.classList.add('tc-description--hidden');
      }
    }
  }

  /**
   * Scrolls the product container back to start on mobile
   * @param {string} tabIndex
   */
  #scrollProductsToStart(tabIndex) {
    const panel = this.querySelector(`[data-tab-panel="${tabIndex}"]`);

    if (panel) {
      panel.scrollLeft = 0;
    }
  }
}

if (!customElements.get('tabbed-collection')) {
  customElements.define('tabbed-collection', TabbedCollection);
}
