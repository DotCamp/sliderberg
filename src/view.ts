/**
 * SliderBerg Frontend Controller
 * Handles the initialization and behavior of sliders on the frontend.
 */

declare const jQuery: any;

declare global {
    interface Window {
        SliderBerg: {
            init: () => void;
            destroyAll: () => void;
        }
    }
}

import { validateTransitionEffect, validateTransitionEasing, validateNumericRange, sanitizeAttributeValue } from './utils/security';

interface SliderBergInterface {
    init: () => void;
    destroyAll: () => void;
}

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

    // Bound event handlers
    private boundPrevSlide: () => void;
    private boundNextSlide: () => void;
    private boundHandleTouchStart: (e: TouchEvent) => void;
    private boundHandleTouchMove: (e: TouchEvent) => void;
    private boundHandleTouchEnd: (e: TouchEvent) => void;
    private boundHandleKeyboard: (e: Event) => void;
    private boundStopAutoplay: () => void;
    private boundStartAutoplay: () => void;
    private boundHandleResize: () => void;
    private boundHandleIntersection: IntersectionObserverCallback;
    private boundHandleFocusIn: () => void;
    private boundHandleFocusOut: (e: Event) => void;


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
            console.warn(`Navigation elements not found for slider ${this.id}, navigation will be disabled`);
        }

        this.elements = {
            container,
            slides,
            prevButton,
            nextButton,
            indicators,
            wrapper: sliderElement
        };

        this.config = this.parseConfig(container);

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

        // Initialize bound event handlers
        this.boundPrevSlide = this.prevSlide.bind(this);
        this.boundNextSlide = this.nextSlide.bind(this);
        this.boundHandleTouchStart = this.handleTouchStart.bind(this);
        this.boundHandleTouchMove = this.handleTouchMove.bind(this);
        this.boundHandleTouchEnd = this.handleTouchEnd.bind(this);
        this.boundHandleKeyboard = this.handleKeyboard.bind(this);
        this.boundStopAutoplay = this.stopAutoplay.bind(this);
        this.boundStartAutoplay = this.startAutoplay.bind(this);
        this.boundHandleResize = this.handleResize.bind(this);
        this.boundHandleIntersection = this.handleIntersection.bind(this);
        this.boundHandleFocusIn = this.handleFocusIn.bind(this);
        this.boundHandleFocusOut = this.handleFocusOut.bind(this);

        this.initialize();
    }

    private parseConfig(container: HTMLElement): SliderConfig {
        return {
            transitionEffect: validateTransitionEffect(this.parseAttribute(container, 'data-transition-effect', 'slide')),
            transitionDuration: validateNumericRange(
                this.parseNumberAttribute(container, 'data-transition-duration', 500),
                200,
                2000,
                500
            ),
            transitionEasing: validateTransitionEasing(this.parseAttribute(container, 'data-transition-easing', 'ease')),
            autoplay: this.parseBooleanAttribute(container, 'data-autoplay', false),
            autoplaySpeed: validateNumericRange(
                this.parseNumberAttribute(container, 'data-autoplay-speed', 5000),
                1000,
                10000,
                5000
            ),
            pauseOnHover: this.parseBooleanAttribute(container, 'data-pause-on-hover', true)
        };
    }

    private parseAttribute(element: HTMLElement, name: string, defaultValue: string): string {
        const value = element.getAttribute(name);
        return value !== null ? sanitizeAttributeValue(value) : defaultValue;
    }

    private parseNumberAttribute(element: HTMLElement, name: string, defaultValue: number): number {
        const value = element.getAttribute(name);
        if (value === null) return defaultValue;
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? defaultValue : parsed;
    }

    private parseBooleanAttribute(element: HTMLElement, name: string, defaultValue: boolean): boolean {
        const value = element.getAttribute(name);
        return value !== null ? value === 'true' : defaultValue;
    }

    private initialize(): void {
        this.elements.slides.forEach((slide) => {
            slide.style.display = '';
        });

        this.setupSliderLayout();
        this.createIndicators();
        this.attachEventListeners();
        this.setupAutoplay();
        this.setupObservers();
        this.updateAriaAttributes();

        setTimeout(() => {
            if (!this.state.destroyed) {
                 this.goToSlide(0, null);
            }
        }, 50);
    }

    private setupSliderLayout(): void {
        const { container, slides } = this.elements;
        const { transitionEffect, transitionDuration, transitionEasing } = this.config;

        if (transitionEffect === 'slide') {
            container.style.display = 'flex';
            container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
            container.style.transform = 'translateX(0)';
            slides.forEach((slide) => {
                slide.style.flex = '0 0 100%';
                slide.style.width = '100%';
                slide.style.minWidth = '100%';
            });
            if (slides.length > 1) {
                this.setupCloneSlides();
            }
        } else if (transitionEffect === 'fade' || transitionEffect === 'zoom') {
            this.setupFadeOrZoomLayout();
        }
    }

    private setupCloneSlides(): void {
        const { container, slides } = this.elements;
        if (slides.length <= 1) return;

        const firstSlideClone = slides[0].cloneNode(true) as HTMLElement;
        const lastSlideClone = slides[slides.length - 1].cloneNode(true) as HTMLElement;

        firstSlideClone.setAttribute('aria-hidden', 'true');
        lastSlideClone.setAttribute('aria-hidden', 'true');
        firstSlideClone.classList.add('sliderberg-clone');
        lastSlideClone.classList.add('sliderberg-clone');
        firstSlideClone.setAttribute('data-clone-of', '0');
        lastSlideClone.setAttribute('data-clone-of', (slides.length - 1).toString());

        container.appendChild(firstSlideClone);
        container.insertBefore(lastSlideClone, slides[0]);

        container.style.transform = 'translateX(-100%)';
        this.state.currentSlide = 1;
    }

    private setupFadeOrZoomLayout(): void {
        const { container, slides } = this.elements;
        const { transitionEffect, transitionDuration, transitionEasing } = this.config;

        container.style.display = 'block';
        container.style.position = 'relative';
        container.style.transition = 'none';

        if (slides[0]) {
            this.updateContainerHeight();
        }

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
            slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
            slide.style.visibility = 'visible';
            slide.style.display = 'block';
        });
    }

    private updateContainerHeight(): void {
        const { container, slides } = this.elements;
        const { transitionEffect } = this.config;
        if (transitionEffect !== 'fade' && transitionEffect !== 'zoom') {
            return;
        }
        const currentActiveSlide = slides[this.getVisibleSlideIndex()]; // Use visible index for correct height
        if (!currentActiveSlide) return;

        const slideHeight = currentActiveSlide.offsetHeight;
        if (slideHeight > 0) {
            container.style.height = `${slideHeight}px`;
        } else {
            const slideMinHeight = getComputedStyle(currentActiveSlide).minHeight;
            if (slideMinHeight && slideMinHeight !== '0px') {
                container.style.height = slideMinHeight;
            } else {
                container.style.height = '400px'; // Fallback height
            }
        }
    }

    private createIndicators(): void {
        const { indicators, slides } = this.elements;
        if (!indicators) return;

        indicators.innerHTML = '';
        slides.forEach((_, index) => {
            const indicator = document.createElement('button');
            indicator.className = `sliderberg-slide-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('aria-label', `Go to slide ${index + 1}`);
            indicator.setAttribute('data-slide-index', index.toString());
            indicator.addEventListener('click', () => {
                if (!this.state.destroyed) this.goToSlide(index, null)
            });
            indicators.appendChild(indicator);
        });
    }

    private updateAriaAttributes(): void {
        const { slides } = this.elements;
        const visibleIndex = this.getVisibleSlideIndex();

        slides.forEach((slide, index) => {
            const isVisible = index === visibleIndex;
            slide.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
            slide.setAttribute('tabindex', isVisible ? '0' : '-1');
            // For better accessibility, consider programmatically focusing the active slide
            // if (isVisible && document.activeElement !== slide && this.elements.wrapper.contains(document.activeElement)) {
            //    slide.focus(); // Be cautious with this as it can cause unexpected page jumps.
            // }
        });
    }

    private getVisibleSlideIndex(): number {
        const { transitionEffect } = this.config;
        const slideCount = this.elements.slides.length;
        if (transitionEffect === 'slide' && slideCount > 1) {
            if (this.state.currentSlide === 0) return slideCount - 1;
            if (this.state.currentSlide === slideCount + 1) return 0;
            return this.state.currentSlide - 1;
        }
        return this.state.currentSlide;
    }

    private updateIndicators(): void {
        const { indicators } = this.elements;
        if (!indicators || !indicators.children) return;

        const dots = indicators.children;
        const indicatorIndex = this.getVisibleSlideIndex();
        Array.from(dots).forEach((dot, index) => {
            dot.classList.toggle('active', index === indicatorIndex);
            dot.setAttribute('aria-pressed', index === indicatorIndex ? 'true' : 'false');
        });
    }

    private goToSlide(index: number, direction: 'next' | 'prev' | null): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        this.state.isAnimating = true;
        const previousSlideIndex = this.getVisibleSlideIndex(); // Get actual previous visible index

        const { transitionEffect } = this.config;
        if (transitionEffect === 'slide') {
            this.handleSlideTransition(index, direction);
        } else if (transitionEffect === 'fade' || transitionEffect === 'zoom') {
            this.handleFadeOrZoomTransition(index, direction, previousSlideIndex);
        }

        this.updateIndicators();
        this.updateAriaAttributes();
        this.dispatchSlideChangeEvent(previousSlideIndex, this.getVisibleSlideIndex());
    }

    private handleSlideTransition(index: number, direction: 'next' | 'prev' | null): void {
        const { container, slides } = this.elements;
        const { transitionDuration, transitionEasing } = this.config;

        if (slides.length > 1) {
            if (direction === null) {
                this.state.currentSlide = index + 1; // Adjust for clones
                container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
                this.scheduleAnimationReset();
            } else if (direction === 'next') {
                this.handleNextSlideTransition();
            } else if (direction === 'prev') {
                this.handlePrevSlideTransition();
            }
        } else {
            this.state.currentSlide = index; // Should be 0
            container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
            this.scheduleAnimationReset();
        }
    }

    private handleNextSlideTransition(): void {
        const { container, slides } = this.elements;
        const { transitionDuration, transitionEasing } = this.config;

        this.state.currentSlide++;
        container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;

        if (this.state.currentSlide === slides.length + 1) { // Moved to the clone of the first slide
            setTimeout(() => {
                if (this.state.destroyed) return;
                container.style.transition = 'none';
                this.state.currentSlide = 1; // Jump to the real first slide
                container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
                container.offsetHeight; // Force reflow
                setTimeout(() => {
                    if (this.state.destroyed) return;
                    container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                    this.state.isAnimating = false;
                }, 10); // Small delay before restoring transition
            }, transitionDuration);
        } else {
            this.scheduleAnimationReset();
        }
    }

    private handlePrevSlideTransition(): void {
        const { container, slides } = this.elements;
        const { transitionDuration, transitionEasing } = this.config;

        this.state.currentSlide--;
        container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;

        if (this.state.currentSlide === 0) { // Moved to the clone of the last slide
            setTimeout(() => {
                if (this.state.destroyed) return;
                container.style.transition = 'none';
                this.state.currentSlide = slides.length; // Jump to the real last slide
                container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
                container.offsetHeight; // Force reflow
                setTimeout(() => {
                    if (this.state.destroyed) return;
                    container.style.transition = `transform ${transitionDuration}ms ${transitionEasing}`;
                    this.state.isAnimating = false;
                }, 10); // Small delay
            }, transitionDuration);
        } else {
            this.scheduleAnimationReset();
        }
    }

    private handleFadeOrZoomTransition(index: number, direction: 'next' | 'prev' | null, previousSlideActualIndex: number): void {
        const { slides } = this.elements;
        const { transitionEffect } = this.config;

        this.state.currentSlide = index; // This is the target "real" slide index
        const currentSlideElement = slides[this.state.currentSlide];
        const previousSlideElement = slides[previousSlideActualIndex];

        if (!currentSlideElement || !previousSlideElement) {
            this.state.isAnimating = false;
            return;
        }

        previousSlideElement.style.zIndex = '0';
        currentSlideElement.style.zIndex = '1';

        previousSlideElement.style.opacity = '0';
        if (transitionEffect === 'zoom') {
            previousSlideElement.style.transform = direction === 'next' ? 'scale(0.95)' : 'scale(1.05)';
        }

        currentSlideElement.style.opacity = '0'; // Start transparent
        if (transitionEffect === 'zoom') {
            currentSlideElement.style.transform = direction === 'next' ? 'scale(1.05)' : 'scale(0.95)';
        }

        currentSlideElement.offsetHeight; // Force reflow

        currentSlideElement.style.opacity = '1';
        if (transitionEffect === 'zoom') {
            currentSlideElement.style.transform = 'scale(1)';
        }

        this.updateContainerHeight();
        this.scheduleAnimationReset();
    }


    private scheduleAnimationReset(): void {
        setTimeout(() => {
            if (!this.state.destroyed) {
                this.state.isAnimating = false;
            }
        }, this.config.transitionDuration + 50); // Add a small buffer
    }

    private prevSlide(): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        const visibleIndex = this.getVisibleSlideIndex();
        const prevIndex = (visibleIndex - 1 + this.elements.slides.length) % this.elements.slides.length;
        this.goToSlide(prevIndex, 'prev');
    }

    private nextSlide(): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        const visibleIndex = this.getVisibleSlideIndex();
        const nextIndex = (visibleIndex + 1) % this.elements.slides.length;
        this.goToSlide(nextIndex, 'next');
    }


    private dispatchSlideChangeEvent(fromActualIndex: number, toActualIndex: number): void {
        const event = new CustomEvent('sliderberg.slidechange', {
            bubbles: true,
            detail: {
                sliderId: this.id, // Add slider ID for easier identification
                from: fromActualIndex,
                to: toActualIndex
            }
        });
        this.elements.wrapper.dispatchEvent(event);
    }

    private attachEventListeners(): void {
        this.attachNavigationListeners();
        this.attachTouchListeners();
        this.attachKeyboardListeners();
        this.attachFocusListenersForAutoplay();
    }

    private attachNavigationListeners(): void {
        const { prevButton, nextButton } = this.elements;
        if (prevButton) {
            prevButton.addEventListener('click', this.boundPrevSlide);
        }
        if (nextButton) {
            nextButton.addEventListener('click', this.boundNextSlide);
        }
    }

    private attachTouchListeners(): void {
        const { container } = this.elements;
        container.addEventListener('touchstart', this.boundHandleTouchStart, { passive: true });
        container.addEventListener('touchmove', this.boundHandleTouchMove, { passive: true });
        container.addEventListener('touchend', this.boundHandleTouchEnd, { passive: true });
    }

    private handleTouchStart(e: TouchEvent): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        if (e.touches.length === 0) return;
        this.state.touchStartX = e.touches[0].clientX;
        this.state.touchStartY = e.touches[0].clientY;
    }

    private handleTouchMove(e: TouchEvent): void {
        // Logic is primarily in handleTouchEnd for basic swipe
    }

    private handleTouchEnd(e: TouchEvent): void {
        if (this.state.isAnimating || this.state.destroyed) return;
        if (e.changedTouches.length === 0) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = this.state.touchStartX - touchEndX;
        const diffY = this.state.touchStartY - touchEndY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > this.state.swipeThreshold) {
            if (diffX > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        }
    }

    private handleKeyboard(e: Event): void {
        if (this.state.destroyed) return;
        const keyboardEvent = e as KeyboardEvent;
        const activeElement = document.activeElement;

        // Only process if slider or its children have focus
        if (!this.elements.wrapper.contains(activeElement)) return;

        switch (keyboardEvent.key) {
            case 'ArrowLeft':
                this.prevSlide();
                e.preventDefault();
                break;
            case 'ArrowRight':
                this.nextSlide();
                e.preventDefault();
                break;
        }
    }


    private attachKeyboardListeners(): void {
        this.elements.wrapper.addEventListener('keydown', this.boundHandleKeyboard);
    }

    private handleFocusIn(): void {
        if (this.config.pauseOnHover) {
            this.stopAutoplay();
        }
    }

    private handleFocusOut(e: Event): void {
        if (this.config.pauseOnHover && !this.elements.wrapper.contains((e as FocusEvent).relatedTarget as Node | null)) {
            this.startAutoplay();
        }
    }


    private attachFocusListenersForAutoplay(): void {
        this.elements.wrapper.addEventListener('focusin', this.boundHandleFocusIn);
        this.elements.wrapper.addEventListener('focusout', this.boundHandleFocusOut);
    }


    private setupAutoplay(): void {
        if (!this.config.autoplay) return;
        this.startAutoplay(); // Start initial autoplay
        if (this.config.pauseOnHover) {
            const { container } = this.elements;
            container.addEventListener('mouseenter', this.boundStopAutoplay);
            container.addEventListener('mouseleave', this.boundStartAutoplay);
            // Also pause on touch interactions if desired
            container.addEventListener('touchstart', this.boundStopAutoplay, { passive: true });
            container.addEventListener('touchend', this.boundStartAutoplay, { passive: true });
        }
    }

    private startAutoplay(): void {
        if (!this.config.autoplay || this.state.autoplayInterval || this.state.destroyed) return;
        this.state.autoplayInterval = window.setInterval(() => {
            if (!this.state.isAnimating && !this.state.destroyed) {
                this.nextSlide();
            }
        }, this.config.autoplaySpeed);
    }

    private stopAutoplay(): void {
        if (this.state.autoplayInterval) {
            clearInterval(this.state.autoplayInterval);
            this.state.autoplayInterval = null;
        }
    }

    private handleResize(): void {
        if (this.state.destroyed) return;
        if (this.config.transitionEffect === 'fade' || this.config.transitionEffect === 'zoom') {
            this.updateContainerHeight();
        }
        if (this.config.transitionEffect === 'slide') {
            const { container } = this.elements;
            // No transition during resize adjustment
            const originalTransition = container.style.transition;
            container.style.transition = 'none';
            container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
            container.offsetHeight; // Force reflow
            container.style.transition = originalTransition;
        }
    }

    private handleIntersection(entries: IntersectionObserverEntry[]): void {
        entries.forEach(entry => {
            if (this.state.destroyed) return;
            if (entry.isIntersecting) {
                if (this.config.autoplay) {
                    this.startAutoplay();
                }
            } else {
                this.stopAutoplay();
            }
        });
    }


    private setupObservers(): void {
        if ('ResizeObserver' in window) {
            this.state.observer = new ResizeObserver(this.boundHandleResize);
            this.state.observer.observe(this.elements.wrapper);
            if (this.config.transitionEffect === 'fade' || this.config.transitionEffect === 'zoom') {
                this.elements.slides.forEach(slide => this.state.observer?.observe(slide));
            }
        }
        if ('IntersectionObserver' in window) {
            this.state.intersectionObserver = new IntersectionObserver(this.boundHandleIntersection, { threshold: 0.1 });
            this.state.intersectionObserver.observe(this.elements.wrapper);
        }
    }

    public destroy(): void {
        if (this.state.destroyed) return;
        this.state.destroyed = true;
        this.stopAutoplay();

        if (this.state.observer) {
            this.state.observer.disconnect();
            this.state.observer = null;
        }
        if (this.state.intersectionObserver) {
            this.state.intersectionObserver.disconnect();
            this.state.intersectionObserver = null;
        }

        const { container, prevButton, nextButton, wrapper, indicators } = this.elements;

        container.removeEventListener('touchstart', this.boundHandleTouchStart);
        container.removeEventListener('touchmove', this.boundHandleTouchMove);
        container.removeEventListener('touchend', this.boundHandleTouchEnd);

        if (this.config.pauseOnHover) {
            container.removeEventListener('mouseenter', this.boundStopAutoplay);
            container.removeEventListener('mouseleave', this.boundStartAutoplay);
            container.removeEventListener('touchstart', this.boundStopAutoplay);
            container.removeEventListener('touchend', this.boundStartAutoplay);
        }

        if (prevButton) {
            prevButton.removeEventListener('click', this.boundPrevSlide);
        }
        if (nextButton) {
            nextButton.removeEventListener('click', this.boundNextSlide);
        }

        wrapper.removeEventListener('keydown', this.boundHandleKeyboard);
        wrapper.removeEventListener('focusin', this.boundHandleFocusIn);
        wrapper.removeEventListener('focusout', this.boundHandleFocusOut);

        // Remove indicator listeners
        if (indicators) {
            Array.from(indicators.children).forEach(indicator => {
                // Clone and replace to remove all listeners effectively
                const newIndicator = indicator.cloneNode(true);
                indicator.parentNode?.replaceChild(newIndicator, indicator);
            });
            indicators.innerHTML = ''; // Clear out indicators
        }


        SliderBergController.instances.delete(this.id);
        console.log(`SliderBerg instance ${this.id} destroyed.`);
    }
}

/**
 * Initialize all SliderBerg sliders on the page
 */
function initializeSliders(): void {
    const sliders: NodeListOf<Element> = document.querySelectorAll('.wp-block-sliderberg-sliderberg');
    if (!sliders.length) {
        // console.warn('No SliderBerg sliders found on the page to initialize.');
        return;
    }
    sliders.forEach((slider: Element) => {
        // Check if an instance already exists for this element to prevent re-initialization
        let alreadyInitialized = false;
        SliderBergController['instances'].forEach(instance => {
            if (instance['elements'].wrapper === slider) {
                alreadyInitialized = true;
            }
        });
        if (!alreadyInitialized) {
            SliderBergController.createInstance(slider);
        }
    });
}

// Initialize sliders when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(initializeSliders, 50));
} else {
    setTimeout(initializeSliders, 50); // Already loaded
}


// Clean up on page unload
window.addEventListener('beforeunload', () => {
    SliderBergController.destroyAll();
});

// Re-initialize on potential AJAX content loads
document.addEventListener('DOMContentLoaded', function() {
    if (typeof jQuery !== 'undefined') {
        jQuery(document).on('ajaxComplete', function(event: any, xhr: any, settings: any) {
            // Simple check if the response might contain new blocks
             if (settings.data && typeof settings.data === 'string' && settings.data.includes('action=load-more')) { // Example condition
                setTimeout(initializeSliders, 150); // Give a bit more time for content to render
            } else if (xhr.responseText && xhr.responseText.includes('wp-block-sliderberg-sliderberg')) {
                setTimeout(initializeSliders, 150);
            }
        });
    }
    document.addEventListener('content-updated', () => setTimeout(initializeSliders, 150)); // For custom theme events
});

// Expose to window
window.SliderBerg = {
    init: initializeSliders,
    destroyAll: SliderBergController.destroyAll
};