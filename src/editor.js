function updateSliderbergSlidesVisibility() {
  document.querySelectorAll('.sliderberg-slides-container[data-current-slide-id]').forEach(container => {
    const currentId = container.getAttribute('data-current-slide-id');
    const slides = Array.from(container.querySelectorAll('.sliderberg-slide'));
    slides.forEach((slide) => {
      slide.style.display = (slide.getAttribute('data-client-id') === currentId) ? '' : 'none';
    });
  });
}

// Run on DOM changes (Gutenberg editor is dynamic)
const observer = new MutationObserver(updateSliderbergSlidesVisibility);
observer.observe(document.body, { childList: true, subtree: true });

// Also run on load
document.addEventListener('DOMContentLoaded', updateSliderbergSlidesVisibility); 