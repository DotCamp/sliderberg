import { HTMLElementWithDataClientId } from './types/common';

declare global {
  interface Window {
    updateSliderbergSlidesVisibility: () => void;
  }
}

function updateSliderbergSlidesVisibility(): void {
  document.querySelectorAll<HTMLElementWithDataClientId>('.sliderberg-slides-container[data-current-slide-id]').forEach(container => {
    const currentId: string | null = container.getAttribute('data-current-slide-id');
    const slides: HTMLElementWithDataClientId[] = Array.from(
      container.querySelectorAll<HTMLElementWithDataClientId>('.sliderberg-slide')
    );
    
    slides.forEach((slide) => {
      slide.style.display = (slide.getAttribute('data-client-id') === currentId) ? '' : 'none';
    });
  });
}

// Expose globally for React to call
window.updateSliderbergSlidesVisibility = updateSliderbergSlidesVisibility;

// Run on DOM changes (Gutenberg editor is dynamic)
const observer: MutationObserver = new MutationObserver(updateSliderbergSlidesVisibility);
observer.observe(document.body, { childList: true, subtree: true });

// Also run on load
document.addEventListener('DOMContentLoaded', updateSliderbergSlidesVisibility);

export {}; // Make this file a module
