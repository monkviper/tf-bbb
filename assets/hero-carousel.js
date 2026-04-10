import { Component } from '@theme/component';

/**
 * @typedef {Object} HeroCarouselRefs
 * @property {HTMLElement[]} slides - Slide elements
 * @property {HTMLElement[]} thumbnails - Thumbnail button elements
 * @property {HTMLElement[]} progressFills - Progress bar fill elements
 * @property {HTMLButtonElement} playPauseBtn - Play/pause toggle button
 * @property {HTMLElement} slidesContainer - Slides scroll container
 * @property {HTMLElement} liveRegion - Aria live region for announcements
 */

/** @extends {Component<HeroCarouselRefs>} */
class HeroCarousel extends Component {
  connectedCallback() {
    super.connectedCallback();

    this.currentIndex = 0;
    this.isPlaying = true;
    this.wasManuallyPaused = false;
    this.progress = 0;
    this.lastTimestamp = null;
    this.animationId = null;

    const speedAttr = this.dataset.autoplaySpeed;
    this.autoplayDuration = (parseInt(speedAttr, 10) || 5) * 1000;

    this.setupIntersectionObserver();
    this.startProgress();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopProgress();

    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!this.wasManuallyPaused && this.isPlaying) {
              this.startProgress();
            }
          } else {
            this.stopProgress();
          }
        }
      },
      { threshold: 0.3 }
    );
    this.observer.observe(this);
  }

  startProgress() {
    if (this.animationId) return;
    this.lastTimestamp = null;
    this.animationId = requestAnimationFrame((ts) => this.tick(ts));
  }

  stopProgress() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.lastTimestamp = null;
  }

  /** @param {number} timestamp */
  tick(timestamp) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const elapsed = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;

    this.progress += (elapsed / this.autoplayDuration) * 100;

    if (this.progress >= 100) {
      this.progress = 0;
      this.updateProgressBar(100);
      this.advanceSlide();
    } else {
      this.updateProgressBar(this.progress);
    }

    this.animationId = requestAnimationFrame((ts) => this.tick(ts));
  }

  /** @param {number} percent */
  updateProgressBar(percent) {
    const fill = this.refs.progressFills?.[this.currentIndex];

    if (fill) {
      fill.style.width = `${percent}%`;
    }
  }

  advanceSlide() {
    const totalSlides = this.refs.slides?.length || 0;

    if (totalSlides === 0) return;

    const nextIndex = (this.currentIndex + 1) % totalSlides;
    this.goToSlide(nextIndex);
  }

  /** @param {number} index */
  goToSlide(index) {
    const slides = this.refs.slides;
    const thumbnails = this.refs.thumbnails;
    const progressFills = this.refs.progressFills;

    if (!slides || !slides.length) return;

    const prevIndex = this.currentIndex;
    this.currentIndex = index;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const isActive = i === index;

      slide.classList.toggle('hero-carousel__slide--active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    }

    if (thumbnails) {
      for (let i = 0; i < thumbnails.length; i++) {
        thumbnails[i].classList.toggle('hero-carousel__thumbnail--active', i === index);
        thumbnails[i].setAttribute('aria-current', i === index ? 'true' : 'false');
      }
    }

    if (progressFills) {
      for (let i = 0; i < progressFills.length; i++) {
        if (i !== index) {
          progressFills[i].style.width = i < index ? '100%' : '0%';
        }
      }
    }

    this.progress = 0;
    this.updateProgressBar(0);

    if (this.refs.liveRegion) {
      const totalSlides = slides.length;
      this.refs.liveRegion.textContent = `Slide ${index + 1} of ${totalSlides}`;
    }
  }

  /**
   * Handle thumbnail click
   * @param {Event} event
   * @param {number} index
   */
  select(event, index) {
    const slideIndex = parseInt(index, 10);
    this.goToSlide(slideIndex);

    this.progress = 0;
    this.lastTimestamp = null;
  }

  /** Handle play/pause toggle */
  togglePlayPause() {
    if (this.isPlaying) {
      this.isPlaying = false;
      this.wasManuallyPaused = true;
      this.stopProgress();
      this.classList.add('is-paused');
    } else {
      this.isPlaying = true;
      this.wasManuallyPaused = false;
      this.startProgress();
      this.classList.remove('is-paused');
    }
  }

  handleMouseEnter() {
    if (this.isPlaying && !this.wasManuallyPaused) {
      this.stopProgress();
    }
  }

  handleMouseLeave() {
    if (this.isPlaying && !this.wasManuallyPaused) {
      this.startProgress();
    }
  }
}

if (!customElements.get('hero-carousel-component')) {
  customElements.define('hero-carousel-component', HeroCarousel);
}
