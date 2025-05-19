/**
 * SliderBerg Frontend Controller
 * Handles the initialization and behavior of sliders on the frontend.
 */

interface SliderConfig {
    transitionEffect: 'slide' | 'fade' | 'zoom';
    transitionDuration: number;
    transitionEasing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
    autoplay: boolean;
    autoplaySpeed: number;
    pauseOnHover: boolean;
}

interface SliderState {
    currentSlide: number;
    isAnimating: boolean;
    autoplayInterval: number | null;
    slideCount: number;
    touchStartX: number;
    touchStartY: number;
    swipeThreshold: number;
    observer: ResizeObserver | null;
    intersectionObserver: IntersectionObserver | null;
    destroyed: boolean;
}

interface SliderElements {
    container: HTMLElement;
    slides: HTMLElement[];
    prevButton: HTMLElement | null;
    nextButton: HTMLElement | null;
    indicators: HTMLElement | null;
    wrapper: Element;
}

class SliderBergController {
    private static instances: Map<string, SliderBergController> = new Map();
    private elements: SliderElements;
    private config: SliderConfig;
    private state: SliderState;
    private id: string;

    /**
     * Create a new slider controller instance
     * @param sliderElement The root slider element
     * @returns SliderBergController instance
     */
    public static createInstance(sliderElement: Element): SliderBergController | null {
        try {
            const id = `slider-${Math.random().toString(36).substring(2, 11)}`;
            const instance = new SliderBergController(sliderElement, id);
            this.instances.set(id, instance);
            return instance;
        } catch (error) {
            console.error('Failed to initialize SliderBerg slider:', error);
            return null;
        }
    }

    /**
     * Clean up all slider instances
     */
    public static destroyAll(): void {
        this.instances.forEach((instance) => {
            instance.destroy();
        });
        this.instances.clear();
    }

    /**
     * Private constructor - use createInstance instead
     */
    private constructor(sliderElement: Element, id: string) {
        this.id = id;
        
        // Find slider elements
        const container = sliderElement.querySelector('.sliderberg-slides-container');
        if (!container || !(container instanceof HTMLElement)) {
            throw new Error('Slider container not found');
        }

        const slides = Array.from(container.children)
            .filter((child) => 
                child.classList.contains('sliderberg-slide') || 
                child.classList.contains('wp-block-sliderberg-slide')
            ) as HTMLElement[];
        
        if (!slides.length) {
            throw new Error('No slides found in slider');
        }

        const prevButton = sliderElement.querySelector('.sliderberg-prev') as HTMLElement | null;
        const nextButton = sliderElement.querySelector('.sliderberg-next') as HTMLElement | null;
        const indicators = sliderElement.querySelector('.sliderberg-slide-indicators') as HTMLElement | null;

        if (!prevButton || !nextButton) {
            console.warn('Navigation elements not found for slider, navigation will be disabled');
        }

        this.elements = {
            container,
            slides,
            prevButton,
            nextButton,
            indicators,
            wrapper: sliderElement
        };

        // Parse configuration
        this.config = this.parseConfig(container);
        
        // Initialize state
        this.state = {
            currentSlide: 0,
            isAnimating: false,
            autoplayInterval: null,
            slideCount: slides.length,
            touchStartX: 0,
            touchStartY: 0,
            swipeThreshold: 50,
            observer: null,
            intersectionObserver: null,
            destroyed: false
        };

        // Initialize the slider
        this.initialize();
    }

    /**
     * Parse configuration from data attributes
     */
    private parseConfig(container: HTMLElement): SliderConfig {
        return {
            transitionEffect: this.parseAttribute(container, 'data-transition-effect', 'slide') as 'slide' | 'fade' | 'zoom',
            transitionDuration: this.parseNumberAttribute(container, 'data-transition-duration', 500),
            transitionEasing: this.parseAttribute(container, 'data-transition-easing', 'ease') as 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear',
            autoplay: this.parseBooleanAttribute(container, 'data-autoplay', false),
            autoplaySpeed: this.parseNumberAttribute(container, 'data-autoplay-speed', 5000),
            pauseOnHover: this.parseBooleanAttribute(container, 'data-pause-on-hover', true)
        };
    }

    /**
     * Helper for parsing string attributes
     */
    private parseAttribute(element: HTMLElement, name: string, defaultValue: string): string {
        const value = element.getAttribute(name);
        return value !== null ? value : defaultValue;
    }

    /**
     * Helper for parsing number attributes
     */
    private parseNumberAttribute(element: HTMLElement, name: string, defaultValue: number): number {
        const value = element.getAttribute(name);
        return value !== null ? parseInt(value, 10) : defaultValue;
    }

    /**
     * Helper for parsing boolean attributes
     */
    private parseBooleanAttribute(element: HTMLElement, name: string, defaultValue: boolean): boolean {
        const value = element.getAttribute(name);
        return value !== null ? value === 'true' : defaultValue;
    }

    /**
     * Initialize the slider
     */
    private initialize(): void {
        // Make sure all slides are visible initially during setup
        this.elements.slides.forEach((slide) => {
            slide.style.display = '';
        });

        this.setupSliderLayout();
        this.createIndicators();
        this.attachEventListeners();
        this.setupAutoplay();
        this.setupObservers();
        this.updateAriaAttributes();

        // Add a small delay before starting animations to ensure all styles are applied
        setTimeout(() => {
            this.goToSlide(0, null);
        }, 50);
    }

    /**
     * Set up the slider layout based on the transition effect
     */
    private setupSliderLayout(): void {
        const { container, slides } = this.elements;
        const { transitionEffect, transitionDuration, transitionEasing } = this.config;

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
            
            // If more than one slide, set up infinite loop with clones
            if (slides.length > 1) {
                this.setupCloneSlides();
            }
        } else if (transitionEffect === 'fade' || transitionEffect === 'zoom') {
            this.setupFadeOrZoomLayout();
        }
    }

    /**
     * Setup clone slides for infinite looping with slide effect
     */
    private setupCloneSlides(): void {
        const { container, slides } = this.elements;
        
        // Clone first and last slides for seamless looping
        const firstSlideClone = slides[0].cloneNode(true) as HTMLElement;
        const lastSlideClone = slides[slides.length - 1].cloneNode(true) as HTMLElement;
        
        firstSlideClone.setAttribute('aria-hidden', 'true');
        lastSlideClone.setAttribute('aria-hidden', 'true');
        firstSlideClone.classList.add('sliderberg-clone');
        lastSlideClone.classList.add('sliderberg-clone');
        firstSlideClone.setAttribute('data-clone-of', '0');
        lastSlideClone.setAttribute('data-clone-of', (slides.length - 1).toString());
        
        // Add the clones to the container
        container.appendChild(firstSlideClone);
        container.insertBefore(lastSlideClone, slides[0]);
        
        // Start at the first real slide (index 1 now, since we added a clone at the beginning)
        container.style.transform = 'translateX(-100%)';
        this.state.currentSlide = 1; // Adjust current slide index to account for the clone
    }

    /**
     * Setup layout for fade or zoom effects
     */
    private setupFadeOrZoomLayout(): void {
        const { container, slides } = this.elements;
        const { transitionEffect, transitionDuration, transitionEasing } = this.config;
        
        // For fade/zoom effects, we need absolute positioning
        container.style.display = 'block';
        container.style.position = 'relative';
        container.style.transition = 'none';
        
        // Set container height to match the first slide's height
        if (slides[0]) {
            this.updateContainerHeight();
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
            
            // Set ARIA attributes
            slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
            
            // Make all slides visible but with appropriate opacity
            slide.style.visibility = 'visible';
            slide.style.display = 'block';
        });
    }

    /**
     * Update container height based on visible slide
     */
    private updateContainerHeight(): void {
        const { container, slides } = this.elements;
        const { transitionEffect } = this.config;
        
        // Only need to set height for fade/zoom effects
        if (transitionEffect !== 'fade' && transitionEffect !== 'zoom') {
            return;
        }
        
        const currentSlide = slides[this.state.currentSlide];
        if (!currentSlide) return;
        
        const slideHeight = currentSlide.offsetHeight;
        
        if (slideHeight > 0) {
            container.style.height = `${slideHeight}px`;
        } else {
            // If height is 0, use min-height from the slide style
            const slideMinHeight = getComputedStyle(currentSlide).minHeight;
            if (slideMinHeight && slideMinHeight !== '0px') {
                container.style.height = slideMinHeight;
            } else {
                container.style.height = '400px'; // Fallback height
            }
        }
    }

    /**
     * Create indicators for each slide
     */
    private createIndicators(): void {
        const { indicators, slides } = this.elements;
        
        if (!indicators) return;
        
        // Clear existing indicators
        indicators.innerHTML = '';
        
        // Create new indicators
        slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `sliderberg-slide-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.setAttribute('data-slide-index', index.toString());
            indicator.addEventListener('click', () => this.goToSlide(index, null));
            indicators.appendChild(indicator);
        });
    }

    /**
     * Update ARIA attributes for accessibility
     */
    private updateAriaAttributes(): void {
        const { slides } = this.elements;
        const visibleIndex = this.getVisibleSlideIndex();
        
        slides.forEach((slide, index) => {
            const isVisible = index === visibleIndex;
            slide.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
            
            // Set tabindex to ensure only the visible slide is in the tab order
            if (isVisible) {
                slide.setAttribute('tabindex', '0');
            } else {
                slide.setAttribute('tabindex', '-1');
            }
        });
    }

    /**
     * Get the actual visible slide index accounting for clones
     */
    private getVisibleSlideIndex(): number {
        const { transitionEffect } = this.config;
        const slideCount = this.elements.slides.length;
        
        if (transitionEffect === 'slide' && slideCount > 1) {
            // If we're using clones, adjust the index
            if (this.state.currentSlide === 0) {
                return slideCount - 1;
            } else if (this.state.currentSlide === slideCount + 1) {
                return 0;
            } else {
                return this.state.currentSlide - 1;
            }
        }
        
        return this.state.currentSlide;
    }

    /**
     * Update indicators to reflect current slide
     */
    private updateIndicators(): void {
        const { indicators } = this.elements;
        if (!indicators) return;
        
        const dots = indicators.children;
        const indicatorIndex = this.getVisibleSlideIndex();
        
        Array.from(dots).forEach((dot, index) => {
            dot.classList.toggle('active', index === indicatorIndex);
            
            // Update ARIA attributes
            dot.setAttribute('aria-pressed', index === indicatorIndex ? 'true' : 'false');
        });
    }

    /**
     * Go to a specific slide
     * @param index The slide index to go to
     * @param direction 'next', 'prev', or null (for direct jumps)
     */
    private goToSlide(index: number, direction: 'next' | 'prev' | null): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        
        this.state.isAnimating = true;
        const previousSlide = this.state.currentSlide;
        
        const { transitionEffect } = this.config;
        const { slides } = this.elements;
        
        // Handle different transition effects
        if (transitionEffect === 'slide') {
            this.handleSlideTransition(index, direction);
        } else if (transitionEffect === 'fade' || transitionEffect === 'zoom') {
            this.handleFadeOrZoomTransition(index, direction, previousSlide);
        }
        
        // Update indicators and ARIA
        this.updateIndicators();
        this.updateAriaAttributes();
        
        // Dispatch custom event
        this.dispatchSlideChangeEvent(previousSlide, this.state.currentSlide);
    }

    /**
     * Handle slide transition effect
     */
    private handleSlideTransition(index: number, direction: 'next' | 'prev' | null): void {
        const { container, slides } = this.elements;
        const { transitionDuration, transitionEasing } = this.config;
        
        // For slide effect with clones, we need special handling
        if (slides.length > 1) {
            // If we're using indicator or direct navigation
            if (direction === null) {
                // Adjust for clones (real slides are at index 1 to slides.length)
                this.state.currentSlide = index + 1;
                container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
                
                // Reset animation state after transition
                this.scheduleAnimationReset();
            } 
            // For next/prev navigation, handle direction
            else if (direction === 'next') {
                this.handleNextSlideTransition();
            } else if (direction === 'prev') {
                this.handlePrevSlideTransition();
            }
        } else {
            // Simple case - only one slide
            this.state.currentSlide = index;
            container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
            this.scheduleAnimationReset();
        }
    }

    /**
     * Handle transition to next slide
     */
    private handleNextSlideTransition(): void {
        const { container, slides } = this.elements;
        const { transitionDuration, transitionEasing } = this.config;
        
        this.state.currentSlide++;
        container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
        
        // If we've moved to the clone of the first slide
        if (this.state.currentSlide === slides.length + 1) {
            // After transition, jump to the real first slide without animation
            setTimeout(() => {
                if (this.state.destroyed) return;
                
                container.style.transition = 'none';
                this.state.currentSlide = 1;
                container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
                
                // Force reflow to ensure the transition is reset
                container.offsetHeight;
                
                // Restore transition for next time
                setTimeout(() => {
                    if (this.state.destroyed) return;
                    container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                    this.state.isAnimating = false;
                }, 10);
            }, transitionDuration);
        } else {
            this.scheduleAnimationReset();
        }
    }

    /**
     * Handle transition to previous slide
     */
    private handlePrevSlideTransition(): void {
        const { container, slides } = this.elements;
        const { transitionDuration, transitionEasing } = this.config;
        
        this.state.currentSlide--;
        container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
        
        // If we've moved to the clone of the last slide
        if (this.state.currentSlide === 0) {
            // After transition, jump to the real last slide without animation
            setTimeout(() => {
                if (this.state.destroyed) return;
                
                container.style.transition = 'none';
                this.state.currentSlide = slides.length;
                container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
                
                // Force reflow to ensure the transition is reset
                container.offsetHeight;
                
                // Restore transition for next time
                setTimeout(() => {
                    if (this.state.destroyed) return;
                    container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                    this.state.isAnimating = false;
                }, 10);
            }, transitionDuration);
        } else {
            this.scheduleAnimationReset();
        }
    }

    /**
     * Handle fade or zoom transition effects
     */
    private handleFadeOrZoomTransition(index: number, direction: 'next' | 'prev' | null, previousSlide: number): void {
        const { slides } = this.elements;
        const { transitionEffect, transitionDuration } = this.config;
        
        this.state.currentSlide = index;
        
        // Update z-index to ensure current slide is on top
        slides[previousSlide].style.zIndex = '0';
        slides[this.state.currentSlide].style.zIndex = '1';
        
        // Fade out current slide
        slides[previousSlide].style.opacity = '0';
        if (transitionEffect === 'zoom') {
            slides[previousSlide].style.transform = direction === 'next' ? 'scale(0.95)' : 'scale(1.05)';
        }
        
        // Set next slide to visible but transparent
        slides[this.state.currentSlide].style.opacity = '0';
        if (transitionEffect === 'zoom') {
            slides[this.state.currentSlide].style.transform = direction === 'next' ? 'scale(1.05)' : 'scale(0.95)';
        }
        
        // Trigger reflow
        slides[this.state.currentSlide].offsetHeight;
        
        // Fade in next slide
        slides[this.state.currentSlide].style.opacity = '1';
        if (transitionEffect === 'zoom') {
            slides[this.state.currentSlide].style.transform = 'scale(1)';
        }
        
        // Update container height if needed
        this.updateContainerHeight();
        
        // Reset animation state after transition
        this.scheduleAnimationReset();
    }

    /**
     * Schedule animation reset after transition completes
     */
    private scheduleAnimationReset(): void {
        setTimeout(() => {
            if (!this.state.destroyed) {
                this.state.isAnimating = false;
            }
        }, this.config.transitionDuration + 50);
    }

    /**
     * Move to the next slide
     */
    private nextSlide(): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        
        const visibleIndex = this.getVisibleSlideIndex();
        const nextIndex = (visibleIndex + 1) % this.elements.slides.length;
        this.goToSlide(nextIndex, 'next');
    }

    /**
     * Move to the previous slide
     */
    private prevSlide(): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        
        const visibleIndex = this.getVisibleSlideIndex();
        const prevIndex = (visibleIndex - 1 + this.elements.slides.length) % this.elements.slides.length;
        this.goToSlide(prevIndex, 'prev');
    }

    /**
     * Dispatch custom event when slide changes
     */
    private dispatchSlideChangeEvent(from: number, to: number): void {
        const event = new CustomEvent('sliderberg.slidechange', {
            bubbles: true,
            detail: {
                slider: this,
                from: this.getVisibleSlideIndex(),
                to: this.getVisibleSlideIndex()
            }
        });
        
        this.elements.wrapper.dispatchEvent(event);
    }

    /**
     * Attach all event listeners
     */
    private attachEventListeners(): void {
        this.attachNavigationListeners();
        this.attachTouchListeners();
        this.attachKeyboardListeners();
        this.attachFocusListeners();
    }

    /**
     * Attach navigation button event listeners
     */
    private attachNavigationListeners(): void {
        const { prevButton, nextButton } = this.elements;
        
        if (prevButton) {
            prevButton.addEventListener('click', this.prevSlide.bind(this));
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', this.nextSlide.bind(this));
        }
    }

    /**
     * Attach touch event listeners for swipe support
     */
    private attachTouchListeners(): void {
        const { container } = this.elements;
        
        // Use passive: true for better performance on touch devices
        container.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        container.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });
        container.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    /**
     * Handle touch start event
     */
    private handleTouchStart(e: TouchEvent): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        
        this.state.touchStartX = e.touches[0].clientX;
        this.state.touchStartY = e.touches[0].clientY;
    }

    /**
     * Track touch movement to determine direction
     */
    private handleTouchMove(e: TouchEvent): void {
        // Not tracking distance in move handler, just keeping the interface consistent
    }

    /**
     * Handle touch end event
     */
    private handleTouchEnd(e: TouchEvent): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        
        // Calculate horizontal and vertical distance
        const diffX = this.state.touchStartX - touchEndX;
        const diffY = this.state.touchStartY - touchEndY;
        
        // If horizontal swipe is greater than vertical and exceeds threshold
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.state.swipeThreshold) {
            if (diffX > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    /**
     * Attach keyboard event listeners for accessibility
     */
    private attachKeyboardListeners(): void {
        const { wrapper } = this.elements;
        
        // Use event delegation for better performance
        wrapper.addEventListener('keydown', (e: KeyboardEvent) => {
            if (this.state.destroyed) return;
            
            // Only process keyboard events when the slider is in focus
            const activeElement = document.activeElement;
            const isSliderFocused = wrapper.contains(activeElement);
            
            if (!isSliderFocused) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                    this.prevSlide();
                    e.preventDefault();
                    break;
                    
                case 'ArrowRight':
                    this.nextSlide();
                    e.preventDefault();
                    break;
            }
        });
    }

    /**
     * Attach focus-related event listeners
     */
    private attachFocusListeners(): void {
        // Pause autoplay when slider is focused for accessibility
        this.elements.wrapper.addEventListener('focusin', () => {
            if (this.config.pauseOnHover) {
                this.stopAutoplay();
            }
        });
        
        this.elements.wrapper.addEventListener('focusout', (e) => {
            if (this.config.pauseOnHover && !this.elements.wrapper.contains(e.relatedTarget as Node)) {
                this.startAutoplay();
            }
        });
    }

    /**
     * Setup autoplay functionality
     */
    private setupAutoplay(): void {
        if (!this.config.autoplay) return;
        
        this.startAutoplay();
        
        if (this.config.pauseOnHover) {
            const { container } = this.elements;
            
            container.addEventListener('mouseenter', this.stopAutoplay.bind(this));
            container.addEventListener('mouseleave', this.startAutoplay.bind(this));
            
            // Also pause on touch
            container.addEventListener('touchstart', this.stopAutoplay.bind(this), { passive: true });
            container.addEventListener('touchend', this.startAutoplay.bind(this), { passive: true });
        }
    }

    /**
     * Start autoplay
     */
    private startAutoplay(): void {
        if (!this.config.autoplay || this.state.autoplayInterval || this.state.destroyed) return;
        
        this.state.autoplayInterval = window.setInterval(() => {
            if (!this.state.isAnimating && !this.state.destroyed) {
                this.nextSlide();
            }
        }, this.config.autoplaySpeed);
    }

    /**
     * Stop autoplay
     */
    private stopAutoplay(): void {
        if (this.state.autoplayInterval) {
            clearInterval(this.state.autoplayInterval);
            this.state.autoplayInterval = null;
        }
    }

    /**
     * Setup ResizeObserver to handle responsive behavior
     */
    private setupObservers(): void {
        // Setup ResizeObserver for responsive height adjustments
        if ('ResizeObserver' in window) {
            this.state.observer = new ResizeObserver(this.handleResize.bind(this));
            this.state.observer.observe(this.elements.wrapper);
            
            // Also observe individual slides for fade/zoom layouts
            if (this.config.transitionEffect === 'fade' || this.config.transitionEffect === 'zoom') {
                this.elements.slides.forEach(slide => {
                    this.state.observer?.observe(slide);
                });
            }
        }
        
        // Setup IntersectionObserver to pause when not visible
        if ('IntersectionObserver' in window) {
            this.state.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (this.config.autoplay && !this.state.destroyed) {
                            this.startAutoplay();
                        }
                    } else {
                        this.stopAutoplay();
                    }
                });
            }, { threshold: 0.1 });
            
            this.state.intersectionObserver.observe(this.elements.wrapper);
        }
    }

    /**
     * Handle resize events
     */
    private handleResize(): void {
        if (this.state.destroyed) return;
        
        // Update container height for fade/zoom effects
        if (this.config.transitionEffect === 'fade' || this.config.transitionEffect === 'zoom') {
            this.updateContainerHeight();
        }
        
        // For slide effect, ensure we're positioned correctly
        if (this.config.transitionEffect === 'slide') {
            const { container } = this.elements;
            container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
        }
    }

    /**
     * Clean up all resources when destroying the slider
     */
    public destroy(): void {
        if (this.state.destroyed) return;
        
        this.state.destroyed = true;
        
        // Stop autoplay
        this.stopAutoplay();
        
        // Disconnect observers
        if (this.state.observer) {
            this.state.observer.disconnect();
            this.state.observer = null;
        }
        
        if (this.state.intersectionObserver) {
            this.state.intersectionObserver.disconnect();
            this.state.intersectionObserver = null;
        }
        
        // Remove event listeners
        const { container, prevButton, nextButton, wrapper } = this.elements;
        
        // Remove touch listeners
        container.removeEventListener('touchstart', this.handleTouchStart.bind(this));
        container.removeEventListener('touchmove', this.handleTouchMove.bind(this));
        container.removeEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // Remove autoplay-related listeners
        if (this.config.pauseOnHover) {
            container.removeEventListener('mouseenter', this.stopAutoplay.bind(this));
            container.removeEventListener('mouseleave', this.startAutoplay.bind(this));
            container.removeEventListener('touchstart', this.stopAutoplay.bind(this));
            container.removeEventListener('touchend', this.startAutoplay.bind(this));
        }
        
        // Remove navigation listeners
        if (prevButton) {
            prevButton.removeEventListener('click', this.prevSlide.bind(this));
        }
        
        if (nextButton) {
            nextButton.removeEventListener('click', this.nextSlide.bind(this));
        }
        
        // Note: We don't need to remove keyboard or indicator listeners as they'll be garbage collected
        // when the element is removed from the DOM
        
        // Remove this instance from the static map
        SliderBergController.instances.delete(this.id);
    }
}

/**
 * Initialize all sliders when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function(): void {
    // Wait a brief moment to ensure all styles are applied
    setTimeout(initializeSliders, 50);
});

/**
 * Initialize all SliderBerg sliders on the page
 */
function initializeSliders(): void {
    const sliders: NodeListOf<Element> = document.querySelectorAll('.wp-block-sliderberg-sliderberg');
    
    if (!sliders.length) {
        console.warn('No SliderBerg sliders found on the page');
        return;
    }
    
    sliders.forEach((slider: Element) => {
        SliderBergController.createInstance(slider);
    });
}

// Clean up on page unload to prevent memory leaks
window.addEventListener('beforeunload', function() {
    SliderBergController.destroyAll();
});

// Re-initialize on AJAX content loads (for WordPress themes with AJAX navigation)
document.addEventListener('DOMContentLoaded', function() {
    // For WordPress AJAX page transitions
    if (typeof jQuery !== 'undefined') {
        jQuery(document).on('ajaxComplete', function() {
            setTimeout(initializeSliders, 100);
        });
    }
    
    // For custom events that might be triggered when content is dynamically loaded
    document.addEventListener('content-updated', function() {
        setTimeout(initializeSliders, 100);
    });
});

// Export for potential use in other modules
window.SliderBerg = {
    init: initializeSliders,
    destroyAll: SliderBergController.destroyAll
};
