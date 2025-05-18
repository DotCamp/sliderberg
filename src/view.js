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
                
                // Create clones for infinite loop effect if needed
                if (slides.length > 1) {
                    // Clone first and last slides for seamless looping
                    const firstSlideClone = slides[0].cloneNode(true);
                    const lastSlideClone = slides[slides.length - 1].cloneNode(true);
                    
                    firstSlideClone.setAttribute('aria-hidden', 'true');
                    lastSlideClone.setAttribute('aria-hidden', 'true');
                    firstSlideClone.classList.add('sliderberg-clone');
                    lastSlideClone.classList.add('sliderberg-clone');
                    
                    // Add the clones to the container
                    container.appendChild(firstSlideClone);
                    container.insertBefore(lastSlideClone, slides[0]);
                    
                    // Start at the first real slide (index 1 now, since we added a clone at the beginning)
                    container.style.transform = 'translateX(-100%)';
                    currentSlide = 1; // Adjust current slide index to account for the clone
                }
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
                indicator.addEventListener('click', () => goToSlide(index, null));
                indicators.appendChild(indicator);
            });
            
            // Update indicators - adjusted for clone slides
            function updateIndicators() {
                const dots = indicators.children;
                let indicatorIndex = currentSlide;
                
                // Adjust indicator index for clone slides
                if (transitionEffect === 'slide' && slides.length > 1) {
                    if (currentSlide === 0) {
                        indicatorIndex = slides.length - 1;
                    } else if (currentSlide === slides.length + 1) {
                        indicatorIndex = 0;
                    } else {
                        indicatorIndex = currentSlide - 1;
                    }
                }
                
                Array.from(dots).forEach((dot, index) => {
                    dot.classList.toggle('active', index === indicatorIndex);
                });
            }
            
            // Go to specific slide
            // direction: 'next', 'prev', or null (for direct jumps)
            function goToSlide(index, direction) {
                if (isAnimating) return;
                isAnimating = true;
                
                const previousSlide = currentSlide;
                
                // For slide effect with clones, we need special handling
                if (transitionEffect === 'slide' && slides.length > 1) {
                    // If we're using indicator or direct navigation
                    if (direction === null) {
                        // Adjust for clones (real slides are at index 1 to slides.length)
                        currentSlide = index + 1;
                        container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                        container.style.transform = `translateX(-${currentSlide * 100}%)`;
                    } 
                    // For next/prev navigation, handle direction
                    else {
                        if (direction === 'next') {
                            currentSlide++;
                            container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                            container.style.transform = `translateX(-${currentSlide * 100}%)`;
                            
                            // If we've moved to the clone of the first slide
                            if (currentSlide === slides.length + 1) {
                                // After transition, jump to the real first slide without animation
                                setTimeout(() => {
                                    container.style.transition = 'none';
                                    currentSlide = 1;
                                    container.style.transform = `translateX(-${currentSlide * 100}%)`;
                                    setTimeout(() => {
                                        container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                                        isAnimating = false;
                                    }, 50);
                                }, transitionDuration);
                            } else {
                                setTimeout(() => { isAnimating = false; }, transitionDuration);
                            }
                        } else if (direction === 'prev') {
                            currentSlide--;
                            container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                            container.style.transform = `translateX(-${currentSlide * 100}%)`;
                            
                            // If we've moved to the clone of the last slide
                            if (currentSlide === 0) {
                                // After transition, jump to the real last slide without animation
                                setTimeout(() => {
                                    container.style.transition = 'none';
                                    currentSlide = slides.length;
                                    container.style.transform = `translateX(-${currentSlide * 100}%)`;
                                    setTimeout(() => {
                                        container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                                        isAnimating = false;
                                    }, 50);
                                }, transitionDuration);
                            } else {
                                setTimeout(() => { isAnimating = false; }, transitionDuration);
                            }
                        }
                    }
                }
                // For fade/zoom effects or sliders with only one slide
                else {
                    currentSlide = index;
                    
                    // Apply different transitions based on effect
                    if (transitionEffect === 'slide') {
                        container.style.transform = `translateX(-${currentSlide * 100}%)`;
                        setTimeout(() => { isAnimating = false; }, transitionDuration + 50);
                    } 
                    else if (transitionEffect === 'fade' || transitionEffect === 'zoom') {
                        // Update z-index to ensure current slide is on top
                        slides[previousSlide].style.zIndex = '0';
                        slides[currentSlide].style.zIndex = '1';
                        
                        // Fade out current slide
                        slides[previousSlide].style.opacity = '0';
                        if (transitionEffect === 'zoom') {
                            slides[previousSlide].style.transform = direction === 'next' ? 'scale(0.95)' : 'scale(1.05)';
                        }
                        
                        // Set next slide to visible but transparent
                        slides[currentSlide].style.opacity = '0';
                        slides[currentSlide].style.visibility = 'visible';
                        slides[currentSlide].style.display = 'block';
                        
                        if (transitionEffect === 'zoom') {
                            slides[currentSlide].style.transform = direction === 'next' ? 'scale(1.05)' : 'scale(0.95)';
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
                }
                
                updateIndicators();
            }
            
            // Next slide
            function nextSlide() {
                if (isAnimating) return;
                
                if (transitionEffect === 'fade' || transitionEffect === 'zoom') {
                    const nextIndex = (currentSlide + 1) % slides.length;
                    goToSlide(nextIndex, 'next');
                } else if (transitionEffect === 'slide') {
                    // For slide effect, we use the direction parameter to manage transitions
                    goToSlide(null, 'next');
                }
            }
            
            // Previous slide
            function prevSlide() {
                if (isAnimating) return;
                
                if (transitionEffect === 'fade' || transitionEffect === 'zoom') {
                    const prevIndex = (currentSlide - 1 + slides.length) % slides.length;
                    goToSlide(prevIndex, 'prev');
                } else if (transitionEffect === 'slide') {
                    // For slide effect, we use the direction parameter to manage transitions
                    goToSlide(null, 'prev');
                }
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