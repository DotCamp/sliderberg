// Frontend initialization code will go here
console.log('SliderBerg frontend initialized'); 

interface SliderConfig {
    transitionEffect: string;
    transitionDuration: number;
    transitionEasing: string;
    autoplay: boolean;
    autoplaySpeed: number;
    pauseOnHover: boolean;
}

interface SliderState {
    currentSlide: number;
    isAnimating: boolean;
    autoplayInterval: number | null;
}

document.addEventListener('DOMContentLoaded', function(): void {
    // Wait a brief moment to ensure all styles are applied
    setTimeout(function(): void {
        initializeSliders();
    }, 50);
    
    function initializeSliders(): void {
        const sliders: NodeListOf<Element> = document.querySelectorAll('.wp-block-sliderberg-sliderberg');
        
        if (!sliders.length) {
            console.warn('No SliderBerg sliders found on the page');
            return;
        }
        
        sliders.forEach((slider: Element): void => {
            const container: HTMLElement | null = slider.querySelector('.sliderberg-slides-container');
            if (!container) {
                console.warn('Slider container not found');
                return;
            }
            
            const slides: HTMLElement[] = Array.from(container.children)
                .filter((child: Element): boolean => 
                    child.classList.contains('sliderberg-slide') || 
                    child.classList.contains('wp-block-sliderberg-slide')
                ) as HTMLElement[];
            
            if (!slides.length) {
                console.warn('No slides found in slider');
                return;
            }
            
            const prevButton: HTMLElement | null = slider.querySelector('.sliderberg-prev');
            const nextButton: HTMLElement | null = slider.querySelector('.sliderberg-next');
            const indicators: HTMLElement | null = slider.querySelector('.sliderberg-slide-indicators');
            
            if (!prevButton || !nextButton || !indicators) {
                console.warn('Navigation elements not found');
                return;
            }
            
            // Get transition settings from data attributes
            const config: SliderConfig = {
                transitionEffect: container.getAttribute('data-transition-effect') || 'slide',
                transitionDuration: parseInt(container.getAttribute('data-transition-duration') || '500'),
                transitionEasing: container.getAttribute('data-transition-easing') || 'ease',
                autoplay: container.getAttribute('data-autoplay') === 'true',
                autoplaySpeed: parseInt(container.getAttribute('data-autoplay-speed') || '5000'),
                pauseOnHover: container.getAttribute('data-pause-on-hover') === 'true'
            };
            
            const state: SliderState = {
                currentSlide: 0,
                isAnimating: false,
                autoplayInterval: null
            };
            
            // Make sure all slides are visible initially during setup
            slides.forEach((slide: HTMLElement): void => {
                slide.style.display = '';
            });
            
            // Setup based on transition effect
            if (config.transitionEffect === 'slide') {
                // For slide effect, keep the original flex layout
                container.style.display = 'flex';
                container.style.transition = `transform ${config.transitionDuration}ms ${config.transitionEasing}`;
                container.style.transform = 'translateX(0)';
                
                // Ensure all slides are properly sized for horizontal sliding
                slides.forEach((slide: HTMLElement): void => {
                    slide.style.flex = '0 0 100%';
                    slide.style.width = '100%';
                    slide.style.minWidth = '100%';
                });
                
                // Create clones for infinite loop effect if needed
                if (slides.length > 1) {
                    // Clone first and last slides for seamless looping
                    const firstSlideClone: HTMLElement = slides[0].cloneNode(true) as HTMLElement;
                    const lastSlideClone: HTMLElement = slides[slides.length - 1].cloneNode(true) as HTMLElement;
                    
                    firstSlideClone.setAttribute('aria-hidden', 'true');
                    lastSlideClone.setAttribute('aria-hidden', 'true');
                    firstSlideClone.classList.add('sliderberg-clone');
                    lastSlideClone.classList.add('sliderberg-clone');
                    
                    // Add the clones to the container
                    container.appendChild(firstSlideClone);
                    container.insertBefore(lastSlideClone, slides[0]);
                    
                    // Start at the first real slide (index 1 now, since we added a clone at the beginning)
                    container.style.transform = 'translateX(-100%)';
                    state.currentSlide = 1; // Adjust current slide index to account for the clone
                }
            } else if (config.transitionEffect === 'fade' || config.transitionEffect === 'zoom') {
                // For fade/zoom effects, we need absolute positioning
                container.style.display = 'block';
                container.style.position = 'relative';
                container.style.transition = 'none';
                
                // Set container height to match the first slide's height
                if (slides[0]) {
                    const firstSlideHeight: number = slides[0].offsetHeight;
                    if (firstSlideHeight > 0) {
                        container.style.height = `${firstSlideHeight}px`;
                    } else {
                        // If height is 0, use min-height from the slide style
                        const slideMinHeight: string = getComputedStyle(slides[0]).minHeight;
                        if (slideMinHeight && slideMinHeight !== '0px') {
                            container.style.height = slideMinHeight;
                        } else {
                            container.style.height = '400px'; // Fallback height
                        }
                    }
                }
                
                // Setup each slide for fade/zoom
                slides.forEach((slide: HTMLElement, index: number): void => {
                    slide.style.position = 'absolute';
                    slide.style.top = '0';
                    slide.style.left = '0';
                    slide.style.width = '100%';
                    slide.style.height = '100%';
                    slide.style.opacity = index === 0 ? '1' : '0';
                    slide.style.transition = `opacity ${config.transitionDuration}ms ${config.transitionEasing}, transform ${config.transitionDuration}ms ${config.transitionEasing}`;
                    slide.style.zIndex = index === 0 ? '1' : '0';
                    
                    if (config.transitionEffect === 'zoom') {
                        slide.style.transform = index === 0 ? 'scale(1)' : 'scale(0.95)';
                    }
                    
                    // Make all slides visible but with appropriate opacity
                    slide.style.visibility = 'visible';
                    slide.style.display = 'block';
                });
            }
            
            // Create indicators
            indicators.innerHTML = '';  // Clear any existing indicators
            slides.forEach((_, index: number): void => {
                const indicator: HTMLButtonElement = document.createElement('button');
                indicator.className = `sliderberg-slide-indicator ${index === 0 ? 'active' : ''}`;
                indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
                indicator.addEventListener('click', (): void => goToSlide(index, null));
                indicators.appendChild(indicator);
            });
            
            // Update indicators - adjusted for clone slides
            function updateIndicators(): void {
                if (!indicators) return;
                const dots: HTMLCollection = indicators.children;
                let indicatorIndex: number = state.currentSlide;
                
                // Adjust indicator index for clone slides
                if (config.transitionEffect === 'slide' && slides.length > 1) {
                    if (state.currentSlide === 0) {
                        indicatorIndex = slides.length - 1;
                    } else if (state.currentSlide === slides.length + 1) {
                        indicatorIndex = 0;
                    } else {
                        indicatorIndex = state.currentSlide - 1;
                    }
                }
                
                Array.from(dots).forEach((dot: Element, index: number): void => {
                    dot.classList.toggle('active', index === indicatorIndex);
                });
            }
            
            // Go to specific slide
            // direction: 'next', 'prev', or null (for direct jumps)
            function goToSlide(index: number, direction: 'next' | 'prev' | null): void {
                if (state.isAnimating || !container) return;
                state.isAnimating = true;
                
                const previousSlide: number = state.currentSlide;
                
                // For slide effect with clones, we need special handling
                if (config.transitionEffect === 'slide' && slides.length > 1) {
                    // If we're using indicator or direct navigation
                    if (direction === null) {
                        // Adjust for clones (real slides are at index 1 to slides.length)
                        state.currentSlide = index + 1;
                        container.style.transition = `transform ${config.transitionDuration}ms ${config.transitionEasing}`;
                        container.style.transform = `translateX(-${state.currentSlide * 100}%)`;
                    } 
                    // For next/prev navigation, handle direction
                    else {
                        if (direction === 'next') {
                            state.currentSlide++;
                            container.style.transition = `transform ${config.transitionDuration}ms ${config.transitionEasing}`;
                            container.style.transform = `translateX(-${state.currentSlide * 100}%)`;
                            
                            // If we've moved to the clone of the first slide
                            if (state.currentSlide === slides.length + 1) {
                                // After transition, jump to the real first slide without animation
                                setTimeout((): void => {
                                    if (!container) return;
                                    container.style.transition = 'none';
                                    state.currentSlide = 1;
                                    container.style.transform = `translateX(-${state.currentSlide * 100}%)`;
                                    setTimeout((): void => {
                                        if (!container) return;
                                        container.style.transition = `transform ${config.transitionDuration}ms ${config.transitionEasing}`;
                                        state.isAnimating = false;
                                    }, 50);
                                }, config.transitionDuration);
                            } else {
                                setTimeout((): void => { state.isAnimating = false; }, config.transitionDuration);
                            }
                        } else if (direction === 'prev') {
                            state.currentSlide--;
                            container.style.transition = `transform ${config.transitionDuration}ms ${config.transitionEasing}`;
                            container.style.transform = `translateX(-${state.currentSlide * 100}%)`;
                            
                            // If we've moved to the clone of the last slide
                            if (state.currentSlide === 0) {
                                // After transition, jump to the real last slide without animation
                                setTimeout((): void => {
                                    if (!container) return;
                                    container.style.transition = 'none';
                                    state.currentSlide = slides.length;
                                    container.style.transform = `translateX(-${state.currentSlide * 100}%)`;
                                    setTimeout((): void => {
                                        if (!container) return;
                                        container.style.transition = `transform ${config.transitionDuration}ms ${config.transitionEasing}`;
                                        state.isAnimating = false;
                                    }, 50);
                                }, config.transitionDuration);
                            } else {
                                setTimeout((): void => { state.isAnimating = false; }, config.transitionDuration);
                            }
                        }
                    }
                }
                // For fade/zoom effects or sliders with only one slide
                else {
                    state.currentSlide = index;
                    
                    // Apply different transitions based on effect
                    if (config.transitionEffect === 'slide') {
                        container.style.transform = `translateX(-${state.currentSlide * 100}%)`;
                        setTimeout((): void => { state.isAnimating = false; }, config.transitionDuration + 50);
                    } 
                    else if (config.transitionEffect === 'fade' || config.transitionEffect === 'zoom') {
                        // Update z-index to ensure current slide is on top
                        slides[previousSlide].style.zIndex = '0';
                        slides[state.currentSlide].style.zIndex = '1';
                        
                        // Fade out current slide
                        slides[previousSlide].style.opacity = '0';
                        if (config.transitionEffect === 'zoom') {
                            slides[previousSlide].style.transform = direction === 'next' ? 'scale(0.95)' : 'scale(1.05)';
                        }
                        
                        // Set next slide to visible but transparent
                        slides[state.currentSlide].style.opacity = '0';
                        if (config.transitionEffect === 'zoom') {
                            slides[state.currentSlide].style.transform = direction === 'next' ? 'scale(1.05)' : 'scale(0.95)';
                        }
                        
                        // Trigger reflow
                        slides[state.currentSlide].offsetHeight;
                        
                        // Fade in next slide
                        slides[state.currentSlide].style.opacity = '1';
                        if (config.transitionEffect === 'zoom') {
                            slides[state.currentSlide].style.transform = 'scale(1)';
                        }
                        
                        setTimeout((): void => { state.isAnimating = false; }, config.transitionDuration);
                    }
                }
                
                updateIndicators();
            }
            
            function nextSlide(): void {
                if (state.isAnimating) return;
                goToSlide((state.currentSlide + 1) % slides.length, 'next');
            }
            
            function prevSlide(): void {
                if (state.isAnimating) return;
                goToSlide((state.currentSlide - 1 + slides.length) % slides.length, 'prev');
            }
            
            // Add event listeners
            prevButton.addEventListener('click', prevSlide);
            nextButton.addEventListener('click', nextSlide);
            
            // Handle swipe events
            let touchStartX: number = 0;
            let touchEndX: number = 0;
            
            function handleSwipe(): void {
                const swipeThreshold: number = 50;
                const diff: number = touchStartX - touchEndX;
                
                if (Math.abs(diff) > swipeThreshold) {
                    if (diff > 0) {
                        nextSlide();
                    } else {
                        prevSlide();
                    }
                }
            }
            
            container.addEventListener('touchstart', (e: TouchEvent): void => {
                touchStartX = e.changedTouches[0].screenX;
            });
            
            container.addEventListener('touchend', (e: TouchEvent): void => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            });
            
            // Autoplay functionality
            function startAutoplay(): void {
                if (config.autoplay && !state.autoplayInterval) {
                    state.autoplayInterval = window.setInterval(nextSlide, config.autoplaySpeed);
                }
            }
            
            function stopAutoplay(): void {
                if (state.autoplayInterval) {
                    clearInterval(state.autoplayInterval);
                    state.autoplayInterval = null;
                }
            }
            
            if (config.autoplay) {
                startAutoplay();
                
                if (config.pauseOnHover) {
                    container.addEventListener('mouseenter', stopAutoplay);
                    container.addEventListener('mouseleave', startAutoplay);
                }
            }
        });
    }
}); 