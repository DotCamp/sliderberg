document.addEventListener('DOMContentLoaded', function() {
    // Wait a brief moment to ensure all styles are applied
    setTimeout(function() {
        initializeSliders();
    }, 50);
    
    function initializeSliders() {
        const sliders = document.querySelectorAll('.wp-block-sliderberg-sliderberg');
        
        if (!sliders.length) {
            console.warn('No SliderBerg sliders found on the page');
            return;
        }
        
        sliders.forEach(slider => {
            const container = slider.querySelector('.sliderberg-slides-container');
            if (!container) {
                console.warn('Slider container not found');
                return;
            }
            
            const slides = Array.from(container.children).filter(child => 
                child.classList.contains('sliderberg-slide') || 
                child.classList.contains('wp-block-sliderberg-slide')
            );
            
            if (!slides.length) {
                console.warn('No slides found in slider');
                return;
            }
            
            const prevButton = slider.querySelector('.sliderberg-prev');
            const nextButton = slider.querySelector('.sliderberg-next');
            const indicators = slider.querySelector('.sliderberg-slide-indicators');
            
            if (!prevButton || !nextButton || !indicators) {
                console.warn('Navigation elements not found');
                return;
            }
            
            // Get transition settings from data attributes
            const transitionEffect = container.getAttribute('data-transition-effect') || 'slide';
            const transitionDuration = parseInt(container.getAttribute('data-transition-duration')) || 500;
            const transitionEasing = container.getAttribute('data-transition-easing') || 'ease';
            
            let currentSlide = 0;
            let isAnimating = false;
            
            // Make sure all slides are visible initially during setup
            slides.forEach((slide) => {
                slide.style.display = '';
            });
            
            // Setup based on transition effect
            if (transitionEffect === 'slide') {
                // For slide effect, keep the original flex layout
                container.style.display = 'flex';
                container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                container.style.transform = 'translateX(0)';
                
                // Ensure all slides are properly sized for horizontal sliding
                slides.forEach((slide) => {
                    slide.style.flex = '0 0 100%';
                    slide.style.width = '100%';
                    slide.style.minWidth = '100%';
                });
            } else if (transitionEffect === 'fade' || transitionEffect === 'zoom') {
                // For fade/zoom effects, we need absolute positioning
                container.style.display = 'block';
                container.style.position = 'relative';
                container.style.transition = 'none';
                
                // Set container height to match the first slide's height
                if (slides[0]) {
                    const firstSlideHeight = slides[0].offsetHeight;
                    if (firstSlideHeight > 0) {
                        container.style.height = `${firstSlideHeight}px`;
                    } else {
                        // If height is 0, use min-height from the slide style
                        const slideMinHeight = getComputedStyle(slides[0]).minHeight;
                        if (slideMinHeight && slideMinHeight !== '0px') {
                            container.style.height = slideMinHeight;
                        } else {
                            container.style.height = '400px'; // Fallback height
                        }
                    }
                }
                
                // Setup each slide for fade/zoom
                slides.forEach((slide, index) => {
                    slide.style.position = 'absolute';
                    slide.style.top = '0';
                    slide.style.left = '0';
                    slide.style.width = '100%';
                    slide.style.height = '100%';
                    slide.style.opacity = index === 0 ? '1' : '0';
                    slide.style.transition = `opacity ${transitionDuration}ms ${transitionEasing}, transform ${transitionDuration}ms ${transitionEasing}`;
                    slide.style.zIndex = index === 0 ? '1' : '0';
                    
                    if (transitionEffect === 'zoom') {
                        slide.style.transform = index === 0 ? 'scale(1)' : 'scale(0.95)';
                    }
                    
                    // Make all slides visible but with appropriate opacity
                    slide.style.visibility = 'visible';
                    slide.style.display = 'block';
                });
            }
            
            // Create indicators
            indicators.innerHTML = '';  // Clear any existing indicators
            slides.forEach((_, index) => {
                const indicator = document.createElement('button');
                indicator.className = `sliderberg-slide-indicator ${index === 0 ? 'active' : ''}`;
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
                if (isAnimating || index === currentSlide) return;
                isAnimating = true;
                
                const previousSlide = currentSlide;
                currentSlide = index;
                
                // Apply different transitions based on effect
                if (transitionEffect === 'slide') {
                    container.style.transform = `translateX(-${currentSlide * 100}%)`;
                    
                    // Reset animation flag after transition completes
                    setTimeout(() => {
                        isAnimating = false;
                    }, transitionDuration + 50);
                } 
                else if (transitionEffect === 'fade' || transitionEffect === 'zoom') {
                    // Update z-index to ensure current slide is on top
                    slides[previousSlide].style.zIndex = '0';
                    slides[currentSlide].style.zIndex = '1';
                    
                    // Fade out current slide
                    slides[previousSlide].style.opacity = '0';
                    if (transitionEffect === 'zoom') {
                        slides[previousSlide].style.transform = 'scale(0.95)';
                    }
                    
                    // Set next slide to visible but transparent
                    slides[currentSlide].style.opacity = '0';
                    slides[currentSlide].style.visibility = 'visible';
                    slides[currentSlide].style.display = 'block';
                    
                    if (transitionEffect === 'zoom') {
                        slides[currentSlide].style.transform = 'scale(1.05)';
                    }
                    
                    // Small delay to ensure the browser recognizes the change
                    setTimeout(() => {
                        // Fade in next slide
                        slides[currentSlide].style.opacity = '1';
                        
                        if (transitionEffect === 'zoom') {
                            slides[currentSlide].style.transform = 'scale(1)';
                        }
                        
                        // Reset animation flag after transition
                        setTimeout(() => {
                            isAnimating = false;
                        }, transitionDuration);
                    }, 20);
                }
                
                updateIndicators();
            }
            
            // Next slide
            function nextSlide() {
                if (isAnimating) return;
                goToSlide((currentSlide + 1) % slides.length);
            }
            
            // Previous slide
            function prevSlide() {
                if (isAnimating) return;
                goToSlide((currentSlide - 1 + slides.length) % slides.length);
            }
            
            // Event listeners
            if (prevButton) prevButton.addEventListener('click', prevSlide);
            if (nextButton) nextButton.addEventListener('click', nextSlide);
            
            // Add keyboard navigation
            slider.setAttribute('tabindex', '0');
            slider.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') {
                    prevSlide();
                } else if (e.key === 'ArrowRight') {
                    nextSlide();
                }
            });
            
            // Initialize
            updateIndicators();
            
            // Add swipe support for touch devices
            let touchStartX = 0;
            let touchEndX = 0;
            
            slider.addEventListener('touchstart', (e) => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });
            
            slider.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
            
            function handleSwipe() {
                const threshold = 50; // Minimum swipe distance
                if (touchEndX < touchStartX - threshold) {
                    nextSlide(); // Swipe left, go to next
                } else if (touchEndX > touchStartX + threshold) {
                    prevSlide(); // Swipe right, go to previous
                }
            }
            
            // Optional: Auto-play
            let autoplayInterval;
            const autoplayEnabled = slider.getAttribute('data-autoplay') !== 'false';
            const autoplayDelay = parseInt(slider.getAttribute('data-autoplay-delay') || 5000);
            
            function startAutoplay() {
                if (autoplayEnabled) {
                    autoplayInterval = setInterval(nextSlide, autoplayDelay);
                }
            }
            
            function stopAutoplay() {
                clearInterval(autoplayInterval);
            }
            
            // Start autoplay if enabled
            if (autoplayEnabled) {
                startAutoplay();
            }
            
            // Pause on hover
            slider.addEventListener('mouseenter', stopAutoplay);
            slider.addEventListener('mouseleave', () => {
                if (autoplayEnabled) {
                    startAutoplay();
                }
            });
            
            // Pause on focus within (accessibility)
            slider.addEventListener('focusin', stopAutoplay);
            slider.addEventListener('focusout', () => {
                if (autoplayEnabled) {
                    startAutoplay();
                }
            });
            
            // Log successful initialization
            console.log(`SliderBerg slider initialized with ${slides.length} slides and ${transitionEffect} transition`);
        });
    }
});