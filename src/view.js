document.addEventListener('DOMContentLoaded', () => {
    const sliders = document.querySelectorAll('.sliderberg-container');

    sliders.forEach(slider => {
        const slidesContainer = slider.querySelector('.sliderberg-slides-container');
        const slides = slidesContainer.children;
        const prevButton = slider.querySelector('.sliderberg-prev');
        const nextButton = slider.querySelector('.sliderberg-next');
        const indicatorsContainer = slider.querySelector('.sliderberg-slide-indicators');
        let currentSlide = 0;

        // Create slide indicators
        Array.from(slides).forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'sliderberg-slide-indicator';
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.addEventListener('click', () => goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });

        // Update indicators
        const updateIndicators = () => {
            const indicators = indicatorsContainer.children;
            Array.from(indicators).forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
        };

        // Go to specific slide
        const goToSlide = (index) => {
            currentSlide = index;
            slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            updateIndicators();
        };

        // Previous slide
        const prevSlide = () => {
            currentSlide = (currentSlide > 0) ? currentSlide - 1 : slides.length - 1;
            goToSlide(currentSlide);
        };

        // Next slide
        const nextSlide = () => {
            currentSlide = (currentSlide < slides.length - 1) ? currentSlide + 1 : 0;
            goToSlide(currentSlide);
        };

        // Add event listeners
        prevButton.addEventListener('click', prevSlide);
        nextButton.addEventListener('click', nextSlide);

        // Initialize
        updateIndicators();
    });
}); 