document.addEventListener('DOMContentLoaded', function() {
    const sliders = document.querySelectorAll('.wp-block-sliderberg-sliderberg');
    
    sliders.forEach(slider => {
        const container = slider.querySelector('.sliderberg-slides-container');
        const slides = container.children;
        const prevButton = slider.querySelector('.sliderberg-prev');
        const nextButton = slider.querySelector('.sliderberg-next');
        const indicators = slider.querySelector('.sliderberg-slide-indicators');
        let currentSlide = 0;
        
        // Create indicators
        Array.from(slides).forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = 'sliderberg-slide-indicator';
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.addEventListener('click', () => goToSlide(index));
            indicators.appendChild(indicator);
        });
        
        // Update indicators
        function updateIndicators() {
            const dots = indicators.children;
            Array.from(dots).forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        // Go to specific slide
        function goToSlide(index) {
            currentSlide = index;
            container.style.transform = `translateX(-${currentSlide * 100}%)`;
            updateIndicators();
        }
        
        // Next slide
        function nextSlide() {
            currentSlide = (currentSlide + 1) % slides.length;
            goToSlide(currentSlide);
        }
        
        // Previous slide
        function prevSlide() {
            currentSlide = (currentSlide - 1 + slides.length) % slides.length;
            goToSlide(currentSlide);
        }
        
        // Event listeners
        prevButton.addEventListener('click', prevSlide);
        nextButton.addEventListener('click', nextSlide);
        
        // Initialize
        updateIndicators();
        
        // Optional: Auto-play
        let autoplayInterval;
        
        function startAutoplay() {
            autoplayInterval = setInterval(nextSlide, 5000);
        }
        
        function stopAutoplay() {
            clearInterval(autoplayInterval);
        }
        
        // Start autoplay
        startAutoplay();
        
        // Pause on hover
        slider.addEventListener('mouseenter', stopAutoplay);
        slider.addEventListener('mouseleave', startAutoplay);
    });
}); 