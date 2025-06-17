/**
 * Main controller for SliderBerg
 * Coordinates animation and event handlers
 */

import { AnimationHandler } from './animation-handler';
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
	private static instances: Map< string, SliderBergController > = new Map();

	private elements: SliderElements;
	private config: SliderConfig;
	private state: SliderState;
	private id: string;

	// Handlers
	private animationHandler!: AnimationHandler;
	private eventHandler!: EventHandler;
	private boundHandleIntersection!: IntersectionObserverCallback;

	/**
	 * Create a new slider controller instance
	 * @param sliderElement
	 */
	public static createInstance(
		sliderElement: Element
	): SliderBergController | null {
		try {
			// Use crypto API for secure random ID generation
			let id: string;
			if (
				typeof window.crypto !== 'undefined' &&
				window.crypto.getRandomValues
			) {
				const array = new Uint32Array( 2 );
				window.crypto.getRandomValues( array );
				id = `slider-${ array[ 0 ].toString(
					36
				) }${ array[ 1 ].toString( 36 ) }`;
			} else {
				// Fallback for older browsers
				id = `slider-${ Date.now().toString( 36 ) }-${ Math.random()
					.toString( 36 )
					.substring( 2, 11 ) }`;
			}

			// Sanitize the ID
			id = sanitizeDOMId( id );

			const instance = new SliderBergController( sliderElement, id );
			SliderBergController.instances.set( id, instance );
			return instance;
		} catch ( error ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to initialize SliderBerg slider:', error );
			return null;
		}
	}

	/**
	 * Clean up all slider instances
	 */
	public static destroyAll(): void {
		SliderBergController.instances.forEach( ( instance ) => {
			instance.destroy();
		} );
		SliderBergController.instances.clear();
	}

	/**
	 * Get all instances
	 */
	public static getInstances(): Map< string, SliderBergController > {
		return SliderBergController.instances;
	}

	/**
	 * Private constructor - use createInstance instead
	 * @param sliderElement
	 * @param id
	 */
	private constructor( sliderElement: Element, id: string ) {
		this.id = id;

		// Look for the slides container - handle nested structures from old content
		let container = sliderElement.querySelector(
			'.sliderberg-slides-container'
		) as HTMLElement | null;

		// If we have nested slider structure (old content), find the innermost container
		if ( container ) {
			const nestedContainer = container.querySelector(
				'.sliderberg-slides-container'
			) as HTMLElement | null;
			if ( nestedContainer ) {
				// Use the nested container instead
				container = nestedContainer;
				// Ensure it has the proper initial styles
				container.style.display = 'flex';
				container.style.width = '100%';
			}
		}

		if ( ! container ) {
			throw new Error( 'Slider container not found' );
		}

		const slides = Array.from( container.children ).filter(
			( child ) =>
				child.classList.contains( 'sliderberg-slide' ) ||
				child.classList.contains( 'wp-block-sliderberg-slide' )
		) as HTMLElement[];

		if ( ! slides.length ) {
			throw new Error( 'No slides found in slider' );
		}

		// For nested structures, look for navigation in the outermost container
		const navContainer = sliderElement.querySelector(
			'.sliderberg-slides-container'
		)
			? sliderElement
			: sliderElement.parentElement;

		const prevButton = navContainer?.querySelector(
			'.sliderberg-prev:not(.sliderberg-slides-container .sliderberg-prev)'
		) as HTMLElement | null;
		const nextButton = navContainer?.querySelector(
			'.sliderberg-next:not(.sliderberg-slides-container .sliderberg-next)'
		) as HTMLElement | null;
		const indicators = navContainer?.querySelector(
			'.sliderberg-slide-indicators:not(.sliderberg-slides-container .sliderberg-slide-indicators)'
		) as HTMLElement | null;

		if ( ! prevButton || ! nextButton ) {
			// eslint-disable-next-line no-console
			console.warn(
				`Navigation elements not found for slider ${ this.id }, navigation will be disabled`
			);
		}

		this.elements = {
			container,
			slides,
			prevButton,
			nextButton,
			indicators,
			wrapper: sliderElement,
		};

		this.config = this.parseConfig( container );

		this.state = {
			startIndex: 0,
			currentSlide: 0,
			isAnimating: false,
			autoplayInterval: null,
			slideCount: slides.length,
			touchStartX: 0,
			touchStartY: 0,
			swipeThreshold: 50,
			observer: null,
			intersectionObserver: null,
			destroyed: false,
		};

		// Initialize handlers
		this.initializeHandlers();
		this.initialize();
	}

	/**
	 * Initialize animation and event handlers
	 */
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
				onSlideChange: this.dispatchSlideChangeEvent.bind( this ),
				onNextSlide: this.nextSlide.bind( this ),
				onPrevSlide: this.prevSlide.bind( this ),
				onResize: this.handleResize.bind( this ),
			}
		);

		this.boundHandleIntersection = this.handleIntersection.bind( this );
	}

	/**
	 * Parse configuration from DOM
	 * @param container
	 */
	private parseConfig( container: HTMLElement ): SliderConfig {
		// Check if carousel mode is enabled first
		const isCarouselMode = this.parseBooleanAttribute(
			container,
			'data-is-carousel',
			false
		);

		// Force slide transition for carousel mode, regardless of saved transition effect
		const rawTransitionEffect = this.parseAttribute(
			container,
			'data-transition-effect',
			'slide'
		);
		const transitionEffect = isCarouselMode
			? 'slide'
			: validateTransitionEffect( rawTransitionEffect );

		return {
			transitionEffect,
			transitionDuration: validateNumericRange(
				this.parseNumberAttribute(
					container,
					'data-transition-duration',
					500
				),
				200,
				2000,
				500
			),
			transitionEasing: validateTransitionEasing(
				this.parseAttribute(
					container,
					'data-transition-easing',
					'ease'
				)
			),
			autoplay: this.parseBooleanAttribute(
				container,
				'data-autoplay',
				false
			),
			autoplaySpeed: validateNumericRange(
				this.parseNumberAttribute(
					container,
					'data-autoplay-speed',
					5000
				),
				1000,
				10000,
				5000
			),
			pauseOnHover: this.parseBooleanAttribute(
				container,
				'data-pause-on-hover',
				true
			),
			// Carousel attributes
			isCarouselMode,
			slidesToShow: this.parseNumberAttribute(
				container,
				'data-slides-to-show',
				1
			),
			slidesToScroll: this.parseNumberAttribute(
				container,
				'data-slides-to-scroll',
				1
			),
			slideSpacing: this.parseNumberAttribute(
				container,
				'data-slide-spacing',
				0
			),
			infiniteLoop: this.parseBooleanAttribute(
				container,
				'data-infinite-loop',
				false
			),
			// Responsive carousel attributes
			tabletSlidesToShow: this.parseNumberAttribute(
				container,
				'data-tablet-slides-to-show',
				2
			),
			tabletSlidesToScroll: this.parseNumberAttribute(
				container,
				'data-tablet-slides-to-scroll',
				1
			),
			tabletSlideSpacing: this.parseNumberAttribute(
				container,
				'data-tablet-slide-spacing',
				15
			),
			mobileSlidesToShow: this.parseNumberAttribute(
				container,
				'data-mobile-slides-to-show',
				1
			),
			mobileSlidesToScroll: this.parseNumberAttribute(
				container,
				'data-mobile-slides-to-scroll',
				1
			),
			mobileSlideSpacing: this.parseNumberAttribute(
				container,
				'data-mobile-slide-spacing',
				10
			),
		};
	}

	/**
	 * Initialize the slider
	 */
	private initialize(): void {
		// Simplify - delegate to handlers
		this.elements.slides.forEach( ( slide ) => {
			slide.style.display = '';
		} );

		this.animationHandler.setupSliderLayout();
		this.createIndicators();
		this.eventHandler.attachEventListeners();
		this.eventHandler.setupAutoplay();
		this.eventHandler.setupObservers( this.boundHandleIntersection );
		this.updateAriaAttributes();

		setTimeout( () => {
			if ( ! this.state.destroyed && this.elements.slides.length > 1 ) {
				this.goToSlide( 0, null );
			}
		}, 50 );
	}

	/**
	 * Navigate to specific slide
	 * @param index
	 * @param direction
	 */
	private goToSlide(
		index: number,
		direction: 'next' | 'prev' | null
	): void {
		if ( this.state.isAnimating || this.state.destroyed ) return;

		this.state.isAnimating = true;
		const previousStartIndex = this.state.startIndex;

		// Delegate animation to handler
		this.animationHandler.handleSlideTransition( index, direction );

		this.updateIndicators();
		this.updateAriaAttributes();

		// Dispatch events
		const currentIndex = this.config.isCarouselMode
			? this.state.startIndex
			: this.state.currentSlide;
		const previousIndex = this.config.isCarouselMode
			? previousStartIndex
			: this.getVisibleSlideIndex();

		this.dispatchSlideChangeEvent( previousIndex, currentIndex );
	}

	/**
	 * Go to next slide
	 */
	private nextSlide(): void {
		if ( this.state.isAnimating || this.state.destroyed ) return;
		const { isCarouselMode, infiniteLoop, transitionEffect } = this.config;

		// Get responsive settings
		const { slidesToShow, slidesToScroll } = this.getResponsiveSettings();

		const totalSlides = this.elements.slides.length;

		// Don't navigate if there's only one slide
		if ( totalSlides <= 1 ) return;

		if (
			! isCarouselMode &&
			( transitionEffect === 'fade' || transitionEffect === 'zoom' )
		) {
			// For fade/zoom NON-carousel mode, use currentSlide instead of startIndex
			let nextIndex = this.state.currentSlide + 1;
			if ( nextIndex >= totalSlides ) {
				nextIndex = 0; // Loop to first slide
			}
			this.goToSlide( nextIndex, 'next' );
		} else {
			// For carousel mode OR slide mode, use startIndex
			let nextIndex =
				this.state.startIndex + ( isCarouselMode ? slidesToScroll : 1 );
			if ( isCarouselMode && infiniteLoop ) {
				// Allow overflow for jump logic
			} else if ( isCarouselMode ) {
				nextIndex = Math.min( nextIndex, totalSlides - slidesToShow );
			}
			this.goToSlide( nextIndex, 'next' );
		}
	}

	/**
	 * Go to previous slide
	 */
	private prevSlide(): void {
		if ( this.state.isAnimating || this.state.destroyed ) return;
		const { isCarouselMode, infiniteLoop, transitionEffect } = this.config;

		// Get responsive settings
		const { slidesToShow, slidesToScroll } = this.getResponsiveSettings();

		const totalSlides = this.elements.slides.length;

		// Don't navigate if there's only one slide
		if ( totalSlides <= 1 ) return;

		if (
			! isCarouselMode &&
			( transitionEffect === 'fade' || transitionEffect === 'zoom' )
		) {
			// For fade/zoom NON-carousel mode, use currentSlide instead of startIndex
			let prevIndex = this.state.currentSlide - 1;
			if ( prevIndex < 0 ) {
				prevIndex = totalSlides - 1; // Loop to last slide
			}
			this.goToSlide( prevIndex, 'prev' );
		} else {
			// For carousel mode OR slide mode, use startIndex
			let prevIndex =
				this.state.startIndex - ( isCarouselMode ? slidesToScroll : 1 );
			if ( isCarouselMode && infiniteLoop ) {
				// Allow negative for jump logic
			} else if ( isCarouselMode ) {
				prevIndex = Math.max( prevIndex, 0 );
			}
			this.goToSlide( prevIndex, 'prev' );
		}
	}

	/**
	 * Create slide indicators
	 */
	private createIndicators(): void {
		const { indicators } = this.elements;
		const { isCarouselMode, infiniteLoop } = this.config;
		if ( ! indicators ) return;

		// Get responsive settings
		const { slidesToShow } = this.getResponsiveSettings();

		const totalSlides = this.elements.slides.length;
		const dotCount = infiniteLoop
			? totalSlides
			: Math.max( 1, totalSlides - slidesToShow + 1 );
		indicators.innerHTML = '';
		for ( let i = 0; i < dotCount; i++ ) {
			const dot = document.createElement( 'button' );
			dot.className =
				'sliderberg-slide-indicator' +
				( i === this.state.startIndex ? ' active' : '' );
			dot.setAttribute( 'aria-label', `Go to slide ${ i + 1 }` );
			dot.setAttribute( 'data-slide-index', i.toString() );
			dot.addEventListener( 'click', () => {
				this.goToSlide( i, null );
			} );
			indicators.appendChild( dot );
		}
	}

	/**
	 * Update slide indicators
	 */
	private updateIndicators(): void {
		const { indicators } = this.elements;
		const { isCarouselMode, infiniteLoop, transitionEffect } = this.config;
		if ( ! indicators ) return;
		const totalSlides = this.elements.slides.length;
		const dotCount = totalSlides;
		indicators.innerHTML = '';

		// Determine active index based on mode
		let activeIndex: number;
		if ( isCarouselMode ) {
			// For carousel mode, always use startIndex
			activeIndex = this.state.startIndex % totalSlides;
		} else {
			// For single slide mode, use the visible slide index
			activeIndex = this.getVisibleSlideIndex();
		}

		for ( let i = 0; i < dotCount; i++ ) {
			const dot = document.createElement( 'button' );
			dot.className =
				'sliderberg-slide-indicator' +
				( i === activeIndex ? ' active' : '' );
			dot.setAttribute( 'aria-label', `Go to slide ${ i + 1 }` );
			dot.setAttribute( 'data-slide-index', i.toString() );
			dot.addEventListener( 'click', () => {
				this.goToSlide( i, null );
			} );
			indicators.appendChild( dot );
		}
	}

	/**
	 * Update ARIA attributes for accessibility
	 */
	private updateAriaAttributes(): void {
		const { slides } = this.elements;
		const visibleIndex = this.getVisibleSlideIndex();

		slides.forEach( ( slide, index ) => {
			const isVisible = index === visibleIndex;
			slide.setAttribute( 'aria-hidden', isVisible ? 'false' : 'true' );
			slide.setAttribute( 'tabindex', isVisible ? '0' : '-1' );
		} );
	}

	/**
	 * Get visible slide index
	 */
	private getVisibleSlideIndex(): number {
		const { transitionEffect } = this.config;
		const slideCount = this.elements.slides.length;
		if ( transitionEffect === 'slide' && slideCount > 1 ) {
			if ( this.state.currentSlide === 0 ) return slideCount - 1;
			if ( this.state.currentSlide === slideCount + 1 ) return 0;
			return this.state.currentSlide - 1;
		}
		return this.state.currentSlide;
	}

	/**
	 * Handle intersection observer
	 * @param entries
	 */
	private handleIntersection( entries: IntersectionObserverEntry[] ): void {
		entries.forEach( ( entry ) => {
			if ( this.state.destroyed ) return;
			if ( entry.isIntersecting ) {
				if ( this.config.autoplay ) {
					this.eventHandler.startAutoplay();
				}
			} else {
				this.eventHandler.stopAutoplay();
			}
		} );
	}

	/**
	 * Dispatch slide change event
	 * @param fromActualIndex
	 * @param toActualIndex
	 */
	private dispatchSlideChangeEvent(
		fromActualIndex: number,
		toActualIndex: number
	): void {
		const event = new CustomEvent( 'sliderberg.slidechange', {
			bubbles: true,
			detail: {
				sliderId: this.id, // Add slider ID for easier identification
				from: fromActualIndex,
				to: toActualIndex,
			},
		} );
		this.elements.wrapper.dispatchEvent( event );
	}

	/**
	 * Destroy slider instance
	 */
	public destroy(): void {
		if ( this.state.destroyed ) return;

		// Mark as destroyed immediately to prevent any further operations
		this.state.destroyed = true;

		// Cleanup handlers
		if ( this.eventHandler ) {
			this.eventHandler.cleanup();
		}
		if ( this.animationHandler && this.animationHandler.cleanup ) {
			this.animationHandler.cleanup();
		}

		// Remove from instances map
		SliderBergController.instances.delete( this.id );

		// Null out all references to break circular dependencies
		this.cleanupReferences();

		// eslint-disable-next-line no-console
		console.log(
			`SliderBerg instance ${ this.id } destroyed and cleaned.`
		);
	}

	/**
	 * Cleanup all references to prevent memory leaks
	 */
	private cleanupReferences(): void {
		// Null out all major references
		this.elements = null as any;
		this.config = null as any;
		this.state = null as any;
		this.animationHandler = null as any;
		this.eventHandler = null as any;
		this.boundHandleIntersection = null as any;
	}

	/**
	 * Get slider elements (for external access)
	 */
	public getElements(): SliderElements {
		return this.elements;
	}

	/**
	 * Get responsive settings
	 */
	private getResponsiveSettings(): {
		slidesToShow: number;
		slidesToScroll: number;
		slideSpacing: number;
	} {
		const { config } = this;
		const viewportWidth = window.innerWidth;

		// Mobile: < 768px
		if ( viewportWidth < 768 ) {
			return {
				slidesToShow: config.mobileSlidesToShow,
				slidesToScroll: config.mobileSlidesToScroll,
				slideSpacing: config.mobileSlideSpacing,
			};
		}
		// Tablet: 768px - 1024px
		else if ( viewportWidth >= 768 && viewportWidth < 1024 ) {
			return {
				slidesToShow: config.tabletSlidesToShow,
				slidesToScroll: config.tabletSlidesToScroll,
				slideSpacing: config.tabletSlideSpacing,
			};
		}
		// Desktop: >= 1024px

		return {
			slidesToShow: config.slidesToShow,
			slidesToScroll: config.slidesToScroll,
			slideSpacing: config.slideSpacing,
		};
	}

	// Keep all utility methods as private
	private parseAttribute(
		element: HTMLElement,
		name: string,
		defaultValue: string
	): string {
		const value = element.getAttribute( name );
		return value !== null ? sanitizeAttributeValue( value ) : defaultValue;
	}

	private parseNumberAttribute(
		element: HTMLElement,
		name: string,
		defaultValue: number
	): number {
		const value = element.getAttribute( name );
		// Use validateDOMNumeric to prevent scientific notation and other bypasses
		return validateDOMNumeric( value, -999999, 999999, defaultValue );
	}

	private parseBooleanAttribute(
		element: HTMLElement,
		name: string,
		defaultValue: boolean
	): boolean {
		const value = element.getAttribute( name );
		return value !== null ? value === 'true' : defaultValue;
	}

	/**
	 * Handle resize events
	 */
	private handleResize(): void {
		if ( this.state.destroyed ) return;

		// Recalculate layout with new responsive settings
		if ( this.config.isCarouselMode ) {
			this.animationHandler.setupSliderLayout();
			this.updateIndicators();

			// Maintain current position but ensure it's valid
			const { slidesToShow } = this.getResponsiveSettings();
			const maxStartIndex = Math.max(
				0,
				this.elements.slides.length - slidesToShow
			);
			if ( this.state.startIndex > maxStartIndex ) {
				this.goToSlide( maxStartIndex, null );
			}
		}

		if (
			this.config.transitionEffect === 'fade' ||
			this.config.transitionEffect === 'zoom'
		) {
			this.animationHandler.updateContainerHeight();
		}
	}
}
