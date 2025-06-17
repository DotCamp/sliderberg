🎯 Frontend Refactoring Guide: SliderBerg Plugin
📋 Overview
This guide outlines how to refactor the view.ts file (1000+ lines) into smaller, maintainable modules while keeping all existing functionality intact.
🎯 Goals

Split large file into logical, focused modules
Maintain all existing functionality - no breaking changes
Improve code organization and readability
Make debugging easier by having focused files
Enable better testing of individual components

📂 New File Structure
src/
├── view.ts # Entry point (simplified)
└── frontend/
├── slider-controller.ts # Main slider logic & coordination
├── animation-handler.ts # All animation & transition logic
├── event-handler.ts # User interactions & events
└── types.ts # Shared frontend types
🔧 Step-by-Step Refactoring
Step 1: Create Shared Types File
📁 src/frontend/types.ts
typescript// Export all your existing interfaces from view.ts
export interface SliderConfig {
// Move existing SliderConfig interface here
}

export interface SliderState {
// Move existing SliderState interface here
}

export interface SliderElements {
// Move existing SliderElements interface here
}

// Keep all your existing type definitions
Step 2: Create Animation Handler
📁 src/frontend/animation-handler.ts
typescriptimport { SliderConfig, SliderState, SliderElements } from './types';

export class AnimationHandler {
private config: SliderConfig;
private state: SliderState;
private elements: SliderElements;

constructor(config: SliderConfig, state: SliderState, elements: SliderElements) {
this.config = config;
this.state = state;
this.elements = elements;
}

// === MOVE THESE METHODS FROM SliderBergController ===

/\*\*

-   Sets up the initial slider layout based on configuration
    \*/
    setupSliderLayout(): void {
    // Move setupSliderLayout() method here
    }

/\*\*

-   Handles slide transition animations
    \*/
    handleSlideTransition(index: number, direction: 'next' | 'prev' | null): void {
    // Move handleSlideTransition() method here
    }

/\*\*

-   Handles next slide transition with infinite loop logic
    \*/
    handleNextSlideTransition(): void {
    // Move handleNextSlideTransition() method here
    }

/\*\*

-   Handles previous slide transition with infinite loop logic
    \*/
    handlePrevSlideTransition(): void {
    // Move handlePrevSlideTransition() method here
    }

/\*\*

-   Handles fade and zoom transition effects
    \*/
    handleFadeOrZoomTransition(
    index: number,
    direction: 'next' | 'prev' | null,
    previousSlideActualIndex: number
    ): void {
    // Move handleFadeOrZoomTransition() method here
    }

/\*\*

-   Updates container height for fade/zoom modes
    \*/
    updateContainerHeight(): void {
    // Move updateContainerHeight() method here
    }

/\*\*

-   Sets up clone slides for infinite scrolling
    \*/
    setupCloneSlides(): void {
    // Move setupCloneSlides() method here
    }

/\*\*

-   Sets up fade or zoom layout
    \*/
    setupFadeOrZoomLayout(): void {
    // Move setupFadeOrZoomLayout() method here
    }

/\*\*

-   Schedules animation reset after transition
    \*/
    scheduleAnimationReset(): void {
    // Move scheduleAnimationReset() method here
    }

/\*\*

-   Gets transition string for CSS
    \*/
    getTransitionString(): string {
    // Move getTransitionString() method here
    }

/\*\*

-   Gets responsive settings based on viewport
    \*/
    getResponsiveSettings(): { slidesToShow: number; slidesToScroll: number; slideSpacing: number } {
    // Move getResponsiveSettings() method here
    }
    }
    Step 3: Create Event Handler
    📁 src/frontend/event-handler.ts
    typescriptimport { SliderConfig, SliderState, SliderElements } from './types';

export class EventHandler {
private config: SliderConfig;
private state: SliderState;
private elements: SliderElements;
private onSlideChange: (fromIndex: number, toIndex: number) => void;
private onNextSlide: () => void;
private onPrevSlide: () => void;

// Bound event handlers (move from SliderBergController)
private boundHandleTouchStart: (e: TouchEvent) => void;
private boundHandleTouchMove: (e: TouchEvent) => void;
private boundHandleTouchEnd: (e: TouchEvent) => void;
private boundHandleKeyboard: (e: Event) => void;
private boundStopAutoplay: () => void;
private boundStartAutoplay: () => void;
private boundHandleResize: () => void;
private boundHandleFocusIn: () => void;
private boundHandleFocusOut: (e: Event) => void;

constructor(
config: SliderConfig,
state: SliderState,
elements: SliderElements,
callbacks: {
onSlideChange: (fromIndex: number, toIndex: number) => void;
onNextSlide: () => void;
onPrevSlide: () => void;
}
) {
this.config = config;
this.state = state;
this.elements = elements;
this.onSlideChange = callbacks.onSlideChange;
this.onNextSlide = callbacks.onNextSlide;
this.onPrevSlide = callbacks.onPrevSlide;

    this.initializeBoundHandlers();

}

// === MOVE THESE METHODS FROM SliderBergController ===

/\*\*

-   Initialize all bound event handlers
    \*/
    private initializeBoundHandlers(): void {
    // Move bound handler initialization here
    }

/\*\*

-   Attach all event listeners
    \*/
    attachEventListeners(): void {
    // Move attachEventListeners() method here
    }

/\*\*

-   Attach navigation button listeners
    \*/
    private attachNavigationListeners(): void {
    // Move attachNavigationListeners() method here
    }

/\*\*

-   Attach touch/swipe listeners
    \*/
    private attachTouchListeners(): void {
    // Move attachTouchListeners() method here
    }

/\*\*

-   Attach keyboard navigation listeners
    \*/
    private attachKeyboardListeners(): void {
    // Move attachKeyboardListeners() method here
    }

/\*\*

-   Attach focus listeners for autoplay
    \*/
    private attachFocusListenersForAutoplay(): void {
    // Move attachFocusListenersForAutoplay() method here
    }

/\*\*

-   Handle touch start events
    \*/
    private handleTouchStart(e: TouchEvent): void {
    // Move handleTouchStart() method here
    }

/\*\*

-   Handle touch move events
    \*/
    private handleTouchMove(e: TouchEvent): void {
    // Move handleTouchMove() method here
    }

/\*\*

-   Handle touch end events
    \*/
    private handleTouchEnd(e: TouchEvent): void {
    // Move handleTouchEnd() method here
    }

/\*\*

-   Handle keyboard navigation
    \*/
    private handleKeyboard(e: Event): void {
    // Move handleKeyboard() method here
    }

/\*\*

-   Handle focus in events
    \*/
    private handleFocusIn(): void {
    // Move handleFocusIn() method here
    }

/\*\*

-   Handle focus out events
    \*/
    private handleFocusOut(e: Event): void {
    // Move handleFocusOut() method here
    }

/\*\*

-   Handle resize events
    \*/
    private handleResize(): void {
    // Move handleResize() method here
    }

/\*\*

-   Setup autoplay functionality
    \*/
    setupAutoplay(): void {
    // Move setupAutoplay() method here
    }

/\*\*

-   Start autoplay
    \*/
    startAutoplay(): void {
    // Move startAutoplay() method here
    }

/\*\*

-   Stop autoplay
    \*/
    stopAutoplay(): void {
    // Move stopAutoplay() method here
    }

/\*\*

-   Setup intersection and resize observers
    \*/
    setupObservers(boundHandleIntersection: IntersectionObserverCallback): void {
    // Move setupObservers() method here
    }

/\*\*

-   Cleanup all event listeners
    \*/
    cleanup(): void {
    // Move cleanup logic here
    }
    }
    Step 4: Refactor Main Controller
    📁 src/frontend/slider-controller.ts
    typescriptimport { AnimationHandler } from './animation-handler';
    import { EventHandler } from './event-handler';
    import { SliderConfig, SliderState, SliderElements } from './types';
    import {
    validateTransitionEffect,
    validateTransitionEasing,
    validateNumericRange,
    sanitizeAttributeValue,
    sanitizeDOMId,
    validateDOMNumeric,
    } from '../utils/security';

export class SliderBergController {
private static instances: Map<string, SliderBergController> = new Map();

private elements: SliderElements;
private config: SliderConfig;
private state: SliderState;
private id: string;

// Handlers
private animationHandler: AnimationHandler;
private eventHandler: EventHandler;
private boundHandleIntersection: IntersectionObserverCallback;

/\*\*

-   Create a new slider controller instance
    \*/
    public static createInstance(sliderElement: Element): SliderBergController | null {
    // Keep existing createInstance logic
    }

/\*\*

-   Clean up all slider instances
    \*/
    public static destroyAll(): void {
    // Keep existing destroyAll logic
    }

/\*\*

-   Private constructor - use createInstance instead
    \*/
    private constructor(sliderElement: Element, id: string) {
    // Keep existing constructor logic for:
    // - this.id assignment
    // - DOM element finding
    // - this.elements setup
    // - this.config parsing
    // - this.state initialization


    // NEW: Initialize handlers
    this.initializeHandlers();
    this.initialize();

}

/\*\*

-   Initialize animation and event handlers
    \*/
    private initializeHandlers(): void {
    this.animationHandler = new AnimationHandler(
    this.config,
    this.state,
    this.elements
    );


    this.eventHandler = new EventHandler(
      this.config,
      this.state,
      this.elements,
      {
        onSlideChange: this.dispatchSlideChangeEvent.bind(this),
        onNextSlide: this.nextSlide.bind(this),
        onPrevSlide: this.prevSlide.bind(this)
      }
    );

    this.boundHandleIntersection = this.handleIntersection.bind(this);

}

// === KEEP THESE METHODS (Core slider logic) ===

/\*\*

-   Parse configuration from DOM
    \*/
    private parseConfig(container: HTMLElement): SliderConfig {
    // Keep existing parseConfig logic
    }

/\*\*

-   Initialize the slider
    \*/
    private initialize(): void {
    // Simplify - delegate to handlers
    this.elements.slides.forEach((slide) => {
    slide.style.display = '';
    });


    this.animationHandler.setupSliderLayout();
    this.createIndicators();
    this.eventHandler.attachEventListeners();
    this.eventHandler.setupAutoplay();
    this.eventHandler.setupObservers(this.boundHandleIntersection);
    this.updateAriaAttributes();

    setTimeout(() => {
      if (!this.state.destroyed && this.elements.slides.length > 1) {
        this.goToSlide(0, null);
      }
    }, 50);

}

/\*\*

-   Navigate to specific slide
    \*/
    private goToSlide(index: number, direction: 'next' | 'prev' | null): void {
    if (this.state.isAnimating || this.state.destroyed) return;


    this.state.isAnimating = true;
    const previousStartIndex = this.state.startIndex;

    // Delegate animation to handler
    this.animationHandler.handleSlideTransition(index, direction);

    this.updateIndicators();
    this.updateAriaAttributes();

    // Dispatch events
    const currentIndex = this.config.isCarouselMode ? this.state.startIndex : this.state.currentSlide;
    const previousIndex = this.config.isCarouselMode ? previousStartIndex : this.getVisibleSlideIndex();

    this.dispatchSlideChangeEvent(previousIndex, currentIndex);

}

/\*\*

-   Go to next slide
    \*/
    private nextSlide(): void {
    // Keep existing nextSlide logic (simplified)
    }

/\*\*

-   Go to previous slide
    \*/
    private prevSlide(): void {
    // Keep existing prevSlide logic (simplified)
    }

/\*\*

-   Create slide indicators
    \*/
    private createIndicators(): void {
    // Keep existing createIndicators logic
    }

/\*\*

-   Update slide indicators
    \*/
    private updateIndicators(): void {
    // Keep existing updateIndicators logic
    }

/\*\*

-   Update ARIA attributes for accessibility
    \*/
    private updateAriaAttributes(): void {
    // Keep existing updateAriaAttributes logic
    }

/\*\*

-   Get visible slide index
    \*/
    private getVisibleSlideIndex(): number {
    // Keep existing getVisibleSlideIndex logic
    }

/\*\*

-   Handle intersection observer
    \*/
    private handleIntersection(entries: IntersectionObserverEntry[]): void {
    // Keep existing handleIntersection logic
    }

/\*\*

-   Dispatch slide change event
    \*/
    private dispatchSlideChangeEvent(fromActualIndex: number, toActualIndex: number): void {
    // Keep existing dispatchSlideChangeEvent logic
    }

/\*\*

-   Destroy slider instance
    \*/
    public destroy(): void {
    if (this.state.destroyed) return;
    this.state.destroyed = true;


    // Delegate cleanup to handlers
    this.eventHandler.cleanup();

    SliderBergController.instances.delete(this.id);
    console.log(`SliderBerg instance ${this.id} destroyed.`);

}

// Keep all utility methods as private
private parseAttribute(/_ ... _/): string { /_ existing logic _/ }
private parseNumberAttribute(/_ ... _/): number { /_ existing logic _/ }
private parseBooleanAttribute(/_ ... _/): boolean { /_ existing logic _/ }
}
Step 5: Simplify Entry Point
📁 src/view.ts (simplified)
typescriptimport { SliderBergController } from './frontend/slider-controller';

// Keep your existing global declarations and interfaces
declare const jQuery: any;
declare global {
interface Window {
SliderBerg: {
init: () => void;
destroyAll: () => void;
};
}
}

/\*\*

-   Initialize all SliderBerg sliders on the page
    \*/
    function initializeSliders(): void {
    const sliders: NodeListOf<Element> = document.querySelectorAll(
    '.wp-block-sliderberg-sliderberg'
    );

if (!sliders.length) {
return;
}

sliders.forEach((slider: Element) => {
// Check if already initialized
let alreadyInitialized = false;
SliderBergController.instances.forEach((instance) => {
if (instance.elements.wrapper === slider) {
alreadyInitialized = true;
}
});

    if (!alreadyInitialized) {
      SliderBergController.createInstance(slider);
    }

});
}

// Keep all your existing initialization and event handling code
if (document.readyState === 'loading') {
document.addEventListener('DOMContentLoaded', () =>
setTimeout(initializeSliders, 50)
);
} else {
setTimeout(initializeSliders, 50);
}

// Keep all existing event listeners and cleanup
window.addEventListener('beforeunload', () => {
SliderBergController.destroyAll();
});

// Keep existing jQuery integration and content-updated listeners

// Expose to window
window.SliderBerg = {
init: initializeSliders,
destroyAll: SliderBergController.destroyAll,
};
📋 Refactoring Checklist

✅ Step-by-Step Execution

Create src/frontend/ directory
Create types.ts with moved interfaces
Create animation-handler.ts with animation methods
Create event-handler.ts with event methods
Refactor slider-controller.ts with remaining logic
Update view.ts to use new structure
Test each step to ensure nothing breaks
