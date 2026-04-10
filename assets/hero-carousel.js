import { Component } from '@theme/component';

/**
 * @typedef {Object} HeroCarouselRefs
 * @property {HTMLElement[]} slides - Slide elements
 * @property {HTMLElement[]} thumbnails - Thumbnail button elements
 * @property {HTMLElement[]} progressFills - Progress bar fill elements
 * @property {HTMLButtonElement} playPauseBtn - Play/pause toggle button
 * @property {HTMLElement} slidesContainer - Slides scroll container
 * @property {HTMLElement} thumbnailsContainer - Thumbnails container
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

    this.buildThumbnails();
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

  /** Build thumbnail buttons from slide data attributes */
  buildThumbnails() {
    const slides = this.refs.slides;
    const container = this.refs.thumbnailsContainer;

    if (!slides || !container || slides.length <= 1) return;

    const totalSlides = slides.length;

    for (let i = 0; i < totalSlides; i++) {
      const slide = slides[i];
      const thumbUrl = slide.dataset.thumbnailUrl;

      const button = document.createElement('button');
      button.className = `hero-carousel__thumbnail${i === 0 ? ' hero-carousel__thumbnail--active' : ''}`;
      button.setAttribute('aria-current', i === 0 ? 'true' : 'false');
      button.setAttribute('type', 'button');
      button.dataset.index = String(i);

      const imageWrapper = document.createElement('span');
      imageWrapper.className = 'hero-carousel__thumbnail-image-wrapper';

      if (thumbUrl) {
        const img = document.createElement('img');
        img.src = thumbUrl;
        img.alt = '';
        img.className = 'hero-carousel__thumbnail-image';
        img.loading = 'eager';
        img.width = 111;
        img.height = 65;
        imageWrapper.appendChild(img);
      } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'hero-carousel__thumbnail-placeholder';
        imageWrapper.appendChild(placeholder);
      }

      const overlay = document.createElement('span');
      overlay.className = 'hero-carousel__thumbnail-overlay';
      imageWrapper.appendChild(overlay);

      const progressTrack = document.createElement('span');
      progressTrack.className = 'hero-carousel__progress-track';

      const progressFill = document.createElement('span');
      progressFill.className = 'hero-carousel__progress-fill';
      progressTrack.appendChild(progressFill);

      button.appendChild(imageWrapper);
      button.appendChild(progressTrack);

      button.addEventListener('click', () => this.select(i));

      container.insertBefore(button, container.firstChild?.nextSibling ? this.refs.playPauseBtn : null);
    }

    // Move play/pause button to the end
    const playPauseBtn = this.refs.playPauseBtn;
    if (playPauseBtn) {
      container.appendChild(playPauseBtn);
    }

    // Store references to generated elements
    this.thumbnailButtons = container.querySelectorAll('.hero-carousel__thumbnail');
    this.progressFillElements = container.querySelectorAll('.hero-carousel__progress-fill');
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
    const fill = this.progressFillElements?.[this.currentIndex];

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

    if (!slides || !slides.length) return;

    this.currentIndex = index;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const isActive = i === index;

      slide.classList.toggle('hero-carousel__slide--active', isActive);
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    }

    if (this.thumbnailButtons) {
      for (let i = 0; i < this.thumbnailButtons.length; i++) {
        this.thumbnailButtons[i].classList.toggle('hero-carousel__thumbnail--active', i === index);
        this.thumbnailButtons[i].setAttribute('aria-current', i === index ? 'true' : 'false');
      }
    }

    if (this.progressFillElements) {
      for (let i = 0; i < this.progressFillElements.length; i++) {
        if (i !== index) {
          this.progressFillElements[i].style.width = i < index ? '100%' : '0%';
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
   * @param {number} index
   */
  select(index) {
    const slideIndex = typeof index === 'number' ? index : parseInt(index, 10);

    if (isNaN(slideIndex)) return;

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

      if (this.refs.playPauseBtn) {
        this.refs.playPauseBtn.setAttribute('aria-label',
          this.refs.playPauseBtn.dataset.playLabel || 'Play slideshow'
        );
      }
    } else {
      this.isPlaying = true;
      this.wasManuallyPaused = false;
      this.startProgress();
      this.classList.remove('is-paused');

      if (this.refs.playPauseBtn) {
        this.refs.playPauseBtn.setAttribute('aria-label',
          this.refs.playPauseBtn.dataset.pauseLabel || 'Pause slideshow'
        );
      }
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
