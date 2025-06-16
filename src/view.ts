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
		};
	}
}

import {
	validateTransitionEffect,
	validateTransitionEasing,
	validateNumericRange,
	sanitizeAttributeValue,
} from './utils/security';

interface SliderBergInterface {
	init: () => void;
	destroyAll: () => void;
}

interface SliderConfig {
	transitionEffect: 'slide' | 'fade' | 'zoom';
	transitionDuration: number;
	transitionEasing:
		| 'ease'
		| 'ease-in'
		| 'ease-out'
		| 'ease-in-out'
		| 'linear';
	autoplay: boolean;
	autoplaySpeed: number;
	pauseOnHover: boolean;
	// Carousel attributes
	isCarouselMode: boolean;
	slidesToShow: number;
	slidesToScroll: number;
	slideSpacing: number;
	infiniteLoop: boolean;
	// Responsive carousel attributes
	tabletSlidesToShow: number;
	tabletSlidesToScroll: number;
	tabletSlideSpacing: number;
	mobileSlidesToShow: number;
	mobileSlidesToScroll: number;
	mobileSlideSpacing: number;
}

interface SliderState {
	startIndex: number; // Index of the leftmost visible slide
	currentSlide: number; // For legacy single-slide logic
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
	private static instances: Map< string, SliderBergController > = new Map();
	private elements: SliderElements;
	private config: SliderConfig;
	private state: SliderState;
	private id: string;

	// Bound event handlers
	private boundPrevSlide: () => void;
	private boundNextSlide: () => void;
	private boundHandleTouchStart: ( e: TouchEvent ) => void;
	private boundHandleTouchMove: ( e: TouchEvent ) => void;
	private boundHandleTouchEnd: ( e: TouchEvent ) => void;
	private boundHandleKeyboard: ( e: Event ) => void;
	private boundStopAutoplay: () => void;
	private boundStartAutoplay: () => void;
	private boundHandleResize: () => void;
	private boundHandleIntersection: IntersectionObserverCallback;
	private boundHandleFocusIn: () => void;
	private boundHandleFocusOut: ( e: Event ) => void;

	/**
	 * Create a new slider controller instance
	 * @param sliderElement The root slider element
	 * @return SliderBergController instance
	 */
	public static createInstance(
		sliderElement: Element
	): SliderBergController | null {
		try {
			const id = `slider-${ Math.random()
				.toString( 36 )
				.substring( 2, 11 ) }`;
			const instance = new SliderBergController( sliderElement, id );
			this.instances.set( id, instance );
			return instance;
		} catch ( error ) {
			console.error( 'Failed to initialize SliderBerg slider:', error );
			return null;
		}
	}

	/**
	 * Clean up all slider instances
	 */
	public static destroyAll(): void {
		this.instances.forEach( ( instance ) => {
			instance.destroy();
		} );
		this.instances.clear();
	}

	/**
	 * Private constructor - use createInstance instead
	 * @param sliderElement
	 * @param id
	 */
	private constructor( sliderElement: Element, id: string ) {
		this.id = id;

		const container = sliderElement.querySelector(
			'.sliderberg-slides-container'
		);
		if ( ! container || ! ( container instanceof HTMLElement ) ) {
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

		const prevButton = sliderElement.querySelector(
			'.sliderberg-prev'
		) as HTMLElement | null;
		const nextButton = sliderElement.querySelector(
			'.sliderberg-next'
		) as HTMLElement | null;
		const indicators = sliderElement.querySelector(
			'.sliderberg-slide-indicators'
		) as HTMLElement | null;

		if ( ! prevButton || ! nextButton ) {
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

		// Initialize bound event handlers
		this.boundPrevSlide = this.prevSlide.bind( this );
		this.boundNextSlide = this.nextSlide.bind( this );
		this.boundHandleTouchStart = this.handleTouchStart.bind( this );
		this.boundHandleTouchMove = this.handleTouchMove.bind( this );
		this.boundHandleTouchEnd = this.handleTouchEnd.bind( this );
		this.boundHandleKeyboard = this.handleKeyboard.bind( this );
		this.boundStopAutoplay = this.stopAutoplay.bind( this );
		this.boundStartAutoplay = this.startAutoplay.bind( this );
		this.boundHandleResize = this.handleResize.bind( this );
		this.boundHandleIntersection = this.handleIntersection.bind( this );
		this.boundHandleFocusIn = this.handleFocusIn.bind( this );
		this.boundHandleFocusOut = this.handleFocusOut.bind( this );

		this.initialize();
	}

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
		if ( value === null ) return defaultValue;
		const parsed = parseInt( value, 10 );
		return isNaN( parsed ) ? defaultValue : parsed;
	}

	private parseBooleanAttribute(
		element: HTMLElement,
		name: string,
		defaultValue: boolean
	): boolean {
		const value = element.getAttribute( name );
		return value !== null ? value === 'true' : defaultValue;
	}

	private initialize(): void {
		this.elements.slides.forEach( ( slide ) => {
			slide.style.display = '';
		} );

		this.setupSliderLayout();
		this.createIndicators();
		this.attachEventListeners();
		this.setupAutoplay();
		this.setupObservers();
		this.updateAriaAttributes();

		setTimeout( () => {
			if ( ! this.state.destroyed && this.elements.slides.length > 1 ) {
				this.goToSlide( 0, null );
			}
		}, 50 );
	}

	private getTransitionString(): string {
		const { transitionDuration, transitionEasing } = this.config;
		return `${ transitionDuration }ms ${ transitionEasing }`;
	}

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
		else {
			return {
				slidesToShow: config.slidesToShow,
				slidesToScroll: config.slidesToScroll,
				slideSpacing: config.slideSpacing,
			};
		}
	}

	private setupSliderLayout(): void {
		const { container, slides } = this.elements;
		const {
			transitionEffect,
			isCarouselMode,
			infiniteLoop,
		} = this.config;

		// Get responsive settings
		const responsiveSettings = this.getResponsiveSettings();
		const { slidesToShow, slideSpacing } = responsiveSettings;

		if (
			transitionEffect === 'slide' &&
			isCarouselMode &&
			slidesToShow > 1 &&
			infiniteLoop
		) {
			// Remove any previous clones
			Array.from(
				container.querySelectorAll( '.sliderberg-clone' )
			).forEach( ( clone ) => clone.remove() );
			// Clone last N slides and prepend
			for (
				let i = slides.length - slidesToShow;
				i < slides.length;
				i++
			) {
				const clone = slides[ i ].cloneNode( true ) as HTMLElement;
				clone.classList.add( 'sliderberg-clone' );
				container.insertBefore( clone, container.firstChild );
			}
			// Clone first N slides and append
			for ( let i = 0; i < slidesToShow; i++ ) {
				const clone = slides[ i ].cloneNode( true ) as HTMLElement;
				clone.classList.add( 'sliderberg-clone' );
				container.appendChild( clone );
			}
			container.style.display = 'flex';
			container.style.transition = `transform ${ this.getTransitionString() }`;
			container.style.gap = `${ slideSpacing }px`;
			const allSlides = Array.from( container.children ) as HTMLElement[];
			allSlides.forEach( ( slide ) => {
				slide.style.flex = `0 0 calc((100% - ${
					( slidesToShow - 1 ) * slideSpacing
				}px) / ${ slidesToShow })`;
				slide.style.width = `calc((100% - ${
					( slidesToShow - 1 ) * slideSpacing
				}px) / ${ slidesToShow })`;
				slide.style.minWidth = `calc((100% - ${
					( slidesToShow - 1 ) * slideSpacing
				}px) / ${ slidesToShow })`;
			} );
			// Set initial transform to show the first real slide
			container.style.transform = `translateX(-${
				slidesToShow * ( 100 / slidesToShow )
			}%)`;
			this.state.startIndex = 0;
		} else if (
			transitionEffect === 'slide' &&
			isCarouselMode &&
			slidesToShow > 1
		) {
			container.style.display = 'flex';
			container.style.transition = `transform ${ this.getTransitionString() }`;
			container.style.transform = 'translateX(0)';
			container.style.gap = `${ slideSpacing }px`;
			slides.forEach( ( slide ) => {
				slide.style.flex = `0 0 calc((100% - ${
					( slidesToShow - 1 ) * slideSpacing
				}px) / ${ slidesToShow })`;
				slide.style.width = `calc((100% - ${
					( slidesToShow - 1 ) * slideSpacing
				}px) / ${ slidesToShow })`;
				slide.style.minWidth = `calc((100% - ${
					( slidesToShow - 1 ) * slideSpacing
				}px) / ${ slidesToShow })`;
			} );
		} else if ( transitionEffect === 'slide' ) {
			container.style.display = 'flex';
			container.style.transition = `transform ${ this.getTransitionString() }`;
			container.style.transform = 'translateX(0)';
			slides.forEach( ( slide ) => {
				slide.style.flex = '0 0 100%';
				slide.style.width = '100%';
				slide.style.minWidth = '100%';
			} );
			if ( slides.length > 1 ) {
				this.setupCloneSlides();
			}
		} else if (
			transitionEffect === 'fade' ||
			transitionEffect === 'zoom'
		) {
			this.setupFadeOrZoomLayout();
		}
	}

	private setupCloneSlides(): void {
		const { container, slides } = this.elements;
		if ( slides.length <= 1 ) return;

		const firstSlideClone = slides[ 0 ].cloneNode( true ) as HTMLElement;
		const lastSlideClone = slides[ slides.length - 1 ].cloneNode(
			true
		) as HTMLElement;

		firstSlideClone.setAttribute( 'aria-hidden', 'true' );
		lastSlideClone.setAttribute( 'aria-hidden', 'true' );
		firstSlideClone.classList.add( 'sliderberg-clone' );
		lastSlideClone.classList.add( 'sliderberg-clone' );
		firstSlideClone.setAttribute( 'data-clone-of', '0' );
		lastSlideClone.setAttribute(
			'data-clone-of',
			( slides.length - 1 ).toString()
		);

		container.appendChild( firstSlideClone );
		container.insertBefore( lastSlideClone, slides[ 0 ] );

		container.style.transform = 'translateX(-100%)';
		this.state.currentSlide = 1;
	}

	private setupFadeOrZoomLayout(): void {
		const { container, slides } = this.elements;
		const { transitionEffect } = this.config;

		container.style.display = 'block';
		container.style.position = 'relative';
		container.style.transition = 'none';

		if ( slides[ 0 ] ) {
			this.updateContainerHeight();
		}

		slides.forEach( ( slide, index ) => {
			slide.style.position = 'absolute';
			slide.style.top = '0';
			slide.style.left = '0';
			slide.style.width = '100%';
			slide.style.height = '100%';
			slide.style.opacity = index === 0 ? '1' : '0';
			slide.style.transition = `opacity ${ this.getTransitionString() }, transform ${ this.getTransitionString() }`;
			slide.style.zIndex = index === 0 ? '1' : '0';
			if ( transitionEffect === 'zoom' ) {
				slide.style.transform =
					index === 0 ? 'scale(1)' : 'scale(0.95)';
			}
			slide.setAttribute( 'aria-hidden', index === 0 ? 'false' : 'true' );
			slide.style.visibility = 'visible';
			slide.style.display = 'block';
		} );
	}

	private updateContainerHeight(): void {
		const { container, slides } = this.elements;
		const { transitionEffect } = this.config;
		if ( transitionEffect !== 'fade' && transitionEffect !== 'zoom' ) {
			return;
		}
		const currentActiveSlide = slides[ this.getVisibleSlideIndex() ]; // Use visible index for correct height
		if ( ! currentActiveSlide ) return;

		const slideHeight = currentActiveSlide.offsetHeight;
		if ( slideHeight > 0 ) {
			container.style.height = `${ slideHeight }px`;
		} else {
			const slideMinHeight =
				getComputedStyle( currentActiveSlide ).minHeight;
			if ( slideMinHeight && slideMinHeight !== '0px' ) {
				container.style.height = slideMinHeight;
			} else {
				container.style.height = '400px'; // Fallback height
			}
		}
	}

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

	private updateAriaAttributes(): void {
		const { slides } = this.elements;
		const visibleIndex = this.getVisibleSlideIndex();

		slides.forEach( ( slide, index ) => {
			const isVisible = index === visibleIndex;
			slide.setAttribute( 'aria-hidden', isVisible ? 'false' : 'true' );
			slide.setAttribute( 'tabindex', isVisible ? '0' : '-1' );
		} );
	}

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

	private updateIndicators(): void {
		const { indicators } = this.elements;
		const { isCarouselMode, infiniteLoop, transitionEffect } =
			this.config;
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

	private goToSlide(
		index: number,
		direction: 'next' | 'prev' | null
	): void {
		if ( this.state.isAnimating || this.state.destroyed ) return;
		this.state.isAnimating = true;
		const previousStartIndex = this.state.startIndex;
		const {
			transitionEffect,
			isCarouselMode,
			infiniteLoop,
		} = this.config;
		
		// Get responsive settings
		const { slidesToShow, slidesToScroll } = this.getResponsiveSettings();
		
		const { container } = this.elements;
		const realSlides = this.elements.slides.length;
		let targetIndex = index;

		if (
			transitionEffect === 'slide' &&
			isCarouselMode &&
			slidesToShow > 1 &&
			infiniteLoop
		) {
			const totalSlides = realSlides;
			const allSlides = Array.from( container.children ) as HTMLElement[];
			const cloneCount = slidesToShow;
			// Move to the correct window (account for clones at start)
			const visualIndex = targetIndex + cloneCount;
			container.style.transition = `transform ${ this.getTransitionString() }`;
			container.style.transform = `translateX(-${
				visualIndex * ( 100 / slidesToShow )
			}%)`;
			this.state.startIndex = targetIndex;
			// After transition, if at a clone, jump to the real slide
			const onTransitionEnd = () => {
				container.removeEventListener(
					'transitionend',
					onTransitionEnd
				);
				if ( targetIndex < 0 ) {
					this.state.startIndex = totalSlides - slidesToShow;
					container.style.transition = 'none';
					container.style.transform = `translateX(-${
						( this.state.startIndex + cloneCount ) *
						( 100 / slidesToShow )
					}%)`;
					// Force reflow
					container.offsetHeight;
					container.style.transition = `transform ${ this.getTransitionString() }`;
				} else if ( targetIndex >= totalSlides ) {
					this.state.startIndex = 0;
					container.style.transition = 'none';
					container.style.transform = `translateX(-${
						cloneCount * ( 100 / slidesToShow )
					}%)`;
					container.offsetHeight;
					container.style.transition = `transform ${ this.getTransitionString() }`;
				}
				this.state.isAnimating = false;
			};
			container.addEventListener( 'transitionend', onTransitionEnd );
		} else if (
			transitionEffect === 'slide' &&
			isCarouselMode &&
			slidesToShow > 1
		) {
			const totalSlides = realSlides;
			targetIndex = Math.max(
				0,
				Math.min( index, totalSlides - slidesToShow )
			);
			this.state.startIndex = targetIndex;
			container.style.transition = `transform ${ this.getTransitionString() }`;
			container.style.transform = `translateX(-${
				targetIndex * ( 100 / slidesToShow )
			}%)`;
			this.state.isAnimating = false;
		} else if ( transitionEffect === 'slide' ) {
			if ( direction === null ) {
				this.state.currentSlide = index + 1; // Adjust for clones
				container.style.transition = `transform ${ this.getTransitionString() }`;
				container.style.transform = `translateX(-${
					this.state.currentSlide * 100
				}%)`;
				this.scheduleAnimationReset();
			} else if ( direction === 'next' ) {
				this.handleNextSlideTransition();
			} else if ( direction === 'prev' ) {
				this.handlePrevSlideTransition();
			}
		} else if (
			transitionEffect === 'fade' ||
			transitionEffect === 'zoom'
		) {
			this.handleFadeOrZoomTransition(
				index,
				direction,
				this.getVisibleSlideIndex()
			);
		}

		this.updateIndicators();
		this.updateAriaAttributes();

		// Use appropriate index for event dispatch - carousel always uses startIndex
		const currentIndex =
			! isCarouselMode &&
			( transitionEffect === 'fade' || transitionEffect === 'zoom' )
				? this.state.currentSlide
				: this.state.startIndex;
		const previousIndex =
			! isCarouselMode &&
			( transitionEffect === 'fade' || transitionEffect === 'zoom' )
				? this.getVisibleSlideIndex()
				: previousStartIndex;

		this.dispatchSlideChangeEvent( previousIndex, currentIndex );
	}

	private handleSlideTransition(
		index: number,
		direction: 'next' | 'prev' | null
	): void {
		const { container, slides } = this.elements;

		if ( slides.length > 1 ) {
			if ( direction === null ) {
				this.state.currentSlide = index + 1; // Adjust for clones
				container.style.transition = `transform ${ this.getTransitionString() }`;
				container.style.transform = `translateX(-${
					this.state.currentSlide * 100
				}%)`;
				this.scheduleAnimationReset();
			} else if ( direction === 'next' ) {
				this.handleNextSlideTransition();
			} else if ( direction === 'prev' ) {
				this.handlePrevSlideTransition();
			}
		} else {
			this.state.currentSlide = index; // Should be 0
			container.style.transform = `translateX(-${
				this.state.currentSlide * 100
			}%)`;
			this.scheduleAnimationReset();
		}
	}

	private handleNextSlideTransition(): void {
		const { container, slides } = this.elements;
		const { transitionDuration } = this.config;

		this.state.currentSlide++;
		container.style.transition = `transform ${ this.getTransitionString() }`;
		container.style.transform = `translateX(-${
			this.state.currentSlide * 100
		}%)`;

		if ( this.state.currentSlide === slides.length + 1 ) {
			// Moved to the clone of the first slide
			setTimeout( () => {
				if ( this.state.destroyed ) return;
				container.style.transition = 'none';
				this.state.currentSlide = 1; // Jump to the real first slide
				container.style.transform = `translateX(-${
					this.state.currentSlide * 100
				}%)`;
				container.offsetHeight; // Force reflow
				setTimeout( () => {
					if ( this.state.destroyed ) return;
					container.style.transition = `transform ${ this.getTransitionString() }`;
					this.state.isAnimating = false;
				}, 10 ); // Small delay before restoring transition
			}, transitionDuration );
		} else {
			this.scheduleAnimationReset();
		}
	}

	private handlePrevSlideTransition(): void {
		const { container, slides } = this.elements;
		const { transitionDuration } = this.config;

		this.state.currentSlide--;
		container.style.transition = `transform ${ this.getTransitionString() }`;
		container.style.transform = `translateX(-${
			this.state.currentSlide * 100
		}%)`;

		if ( this.state.currentSlide === 0 ) {
			// Moved to the clone of the last slide
			setTimeout( () => {
				if ( this.state.destroyed ) return;
				container.style.transition = 'none';
				this.state.currentSlide = slides.length; // Jump to the real last slide
				container.style.transform = `translateX(-${
					this.state.currentSlide * 100
				}%)`;
				container.offsetHeight; // Force reflow
				setTimeout( () => {
					if ( this.state.destroyed ) return;
					container.style.transition = `transform ${ this.getTransitionString() }`;
					this.state.isAnimating = false;
				}, 10 ); // Small delay
			}, transitionDuration );
		} else {
			this.scheduleAnimationReset();
		}
	}

	private handleFadeOrZoomTransition(
		index: number,
		direction: 'next' | 'prev' | null,
		previousSlideActualIndex: number
	): void {
		const { slides } = this.elements;
		const { transitionEffect } = this.config;

		this.state.currentSlide = index; // This is the target "real" slide index
		const currentSlideElement = slides[ this.state.currentSlide ];
		const previousSlideElement = slides[ previousSlideActualIndex ];

		if ( ! currentSlideElement || ! previousSlideElement ) {
			this.state.isAnimating = false;
			return;
		}

		previousSlideElement.style.zIndex = '0';
		currentSlideElement.style.zIndex = '1';

		// Apply proper transition timing to both slides
		previousSlideElement.style.transition = `opacity ${ this.getTransitionString() }, transform ${ this.getTransitionString() }`;
		currentSlideElement.style.transition = `opacity ${ this.getTransitionString() }, transform ${ this.getTransitionString() }`;

		previousSlideElement.style.opacity = '0';
		if ( transitionEffect === 'zoom' ) {
			previousSlideElement.style.transform =
				direction === 'next' ? 'scale(0.95)' : 'scale(1.05)';
		}

		currentSlideElement.style.opacity = '0'; // Start transparent
		if ( transitionEffect === 'zoom' ) {
			currentSlideElement.style.transform =
				direction === 'next' ? 'scale(1.05)' : 'scale(0.95)';
		}

		currentSlideElement.offsetHeight; // Force reflow

		currentSlideElement.style.opacity = '1';
		if ( transitionEffect === 'zoom' ) {
			currentSlideElement.style.transform = 'scale(1)';
		}

		this.updateContainerHeight();
		this.scheduleAnimationReset();
	}

	private scheduleAnimationReset(): void {
		setTimeout( () => {
			if ( ! this.state.destroyed ) {
				this.state.isAnimating = false;
			}
		}, this.config.transitionDuration + 50 ); // Add a small buffer
	}

	private prevSlide(): void {
		if ( this.state.isAnimating || this.state.destroyed ) return;
		const {
			isCarouselMode,
			infiniteLoop,
			transitionEffect,
		} = this.config;
		
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

	private nextSlide(): void {
		if ( this.state.isAnimating || this.state.destroyed ) return;
		const {
			isCarouselMode,
			infiniteLoop,
			transitionEffect,
		} = this.config;
		
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

	private attachEventListeners(): void {
		this.attachNavigationListeners();
		this.attachTouchListeners();
		this.attachKeyboardListeners();
		this.attachFocusListenersForAutoplay();
	}

	private attachNavigationListeners(): void {
		const { prevButton, nextButton } = this.elements;
		if ( prevButton ) {
			prevButton.addEventListener( 'click', this.boundPrevSlide );
		}
		if ( nextButton ) {
			nextButton.addEventListener( 'click', this.boundNextSlide );
		}
	}

	private attachTouchListeners(): void {
		const { container } = this.elements;
		container.addEventListener( 'touchstart', this.boundHandleTouchStart, {
			passive: true,
		} );
		container.addEventListener( 'touchmove', this.boundHandleTouchMove, {
			passive: true,
		} );
		container.addEventListener( 'touchend', this.boundHandleTouchEnd, {
			passive: true,
		} );
	}

	private handleTouchStart( e: TouchEvent ): void {
		if ( this.state.isAnimating || this.state.destroyed ) return;
		if ( e.touches.length === 0 ) return;
		this.state.touchStartX = e.touches[ 0 ].clientX;
		this.state.touchStartY = e.touches[ 0 ].clientY;
	}

	private handleTouchMove( e: TouchEvent ): void {
		// Logic is primarily in handleTouchEnd for basic swipe
	}

	private handleTouchEnd( e: TouchEvent ): void {
		if ( this.state.isAnimating || this.state.destroyed ) return;
		if ( e.changedTouches.length === 0 ) return;

		// Don't handle swipe if there's only one slide
		if ( this.elements.slides.length <= 1 ) return;

		const touchEndX = e.changedTouches[ 0 ].clientX;
		const touchEndY = e.changedTouches[ 0 ].clientY;
		const diffX = this.state.touchStartX - touchEndX;
		const diffY = this.state.touchStartY - touchEndY;

		if (
			Math.abs( diffX ) > Math.abs( diffY ) &&
			Math.abs( diffX ) > this.state.swipeThreshold
		) {
			if ( diffX > 0 ) {
				this.nextSlide();
			} else {
				this.prevSlide();
			}
		}
	}

	private handleKeyboard( e: Event ): void {
		if ( this.state.destroyed ) return;
		const keyboardEvent = e as KeyboardEvent;
		const activeElement = document.activeElement;

		// Only process if slider or its children have focus
		if ( ! this.elements.wrapper.contains( activeElement ) ) return;

		// Don't handle keyboard navigation if there's only one slide
		if ( this.elements.slides.length <= 1 ) return;

		switch ( keyboardEvent.key ) {
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
		this.elements.wrapper.addEventListener(
			'keydown',
			this.boundHandleKeyboard
		);
	}

	private handleFocusIn(): void {
		if ( this.config.pauseOnHover ) {
			this.stopAutoplay();
		}
	}

	private handleFocusOut( e: Event ): void {
		if (
			this.config.pauseOnHover &&
			! this.elements.wrapper.contains(
				( e as FocusEvent ).relatedTarget as Node | null
			)
		) {
			this.startAutoplay();
		}
	}

	private attachFocusListenersForAutoplay(): void {
		this.elements.wrapper.addEventListener(
			'focusin',
			this.boundHandleFocusIn
		);
		this.elements.wrapper.addEventListener(
			'focusout',
			this.boundHandleFocusOut
		);
	}

	private setupAutoplay(): void {
		if ( ! this.config.autoplay || this.elements.slides.length <= 1 ) return;
		this.startAutoplay(); // Start initial autoplay
		if ( this.config.pauseOnHover ) {
			const { container } = this.elements;
			container.addEventListener( 'mouseenter', this.boundStopAutoplay );
			container.addEventListener( 'mouseleave', this.boundStartAutoplay );
			// Also pause on touch interactions if desired
			container.addEventListener( 'touchstart', this.boundStopAutoplay, {
				passive: true,
			} );
			container.addEventListener( 'touchend', this.boundStartAutoplay, {
				passive: true,
			} );
		}
	}

	private startAutoplay(): void {
		if (
			! this.config.autoplay ||
			this.state.autoplayInterval ||
			this.state.destroyed ||
			this.elements.slides.length <= 1
		)
			return;
		this.state.autoplayInterval = window.setInterval( () => {
			if ( ! this.state.isAnimating && ! this.state.destroyed ) {
				this.nextSlide();
			}
		}, this.config.autoplaySpeed );
	}

	private stopAutoplay(): void {
		if ( this.state.autoplayInterval ) {
			clearInterval( this.state.autoplayInterval );
			this.state.autoplayInterval = null;
		}
	}

	private handleResize(): void {
		if ( this.state.destroyed ) return;
		
		// Recalculate layout with new responsive settings
		if ( this.config.isCarouselMode ) {
			this.setupSliderLayout();
			this.updateIndicators();
			
			// Maintain current position but ensure it's valid
			const { slidesToShow } = this.getResponsiveSettings();
			const maxStartIndex = Math.max( 0, this.elements.slides.length - slidesToShow );
			if ( this.state.startIndex > maxStartIndex ) {
				this.goToSlide( maxStartIndex, null );
			}
		}
		
		if (
			this.config.transitionEffect === 'fade' ||
			this.config.transitionEffect === 'zoom'
		) {
			this.updateContainerHeight();
		}
		if ( this.config.transitionEffect === 'slide' && !this.config.isCarouselMode ) {
			const { container } = this.elements;
			// No transition during resize adjustment
			const originalTransition = container.style.transition;
			container.style.transition = 'none';
			container.style.transform = `translateX(-${
				this.state.currentSlide * 100
			}%)`;
			container.offsetHeight; // Force reflow
			container.style.transition = originalTransition;
		}
	}

	private handleIntersection( entries: IntersectionObserverEntry[] ): void {
		entries.forEach( ( entry ) => {
			if ( this.state.destroyed ) return;
			if ( entry.isIntersecting ) {
				if ( this.config.autoplay ) {
					this.startAutoplay();
				}
			} else {
				this.stopAutoplay();
			}
		} );
	}

	private setupObservers(): void {
		if ( 'ResizeObserver' in window ) {
			this.state.observer = new ResizeObserver( this.boundHandleResize );
			this.state.observer.observe( this.elements.wrapper );
			if (
				this.config.transitionEffect === 'fade' ||
				this.config.transitionEffect === 'zoom'
			) {
				this.elements.slides.forEach(
					( slide ) => this.state.observer?.observe( slide )
				);
			}
		}
		if ( 'IntersectionObserver' in window ) {
			this.state.intersectionObserver = new IntersectionObserver(
				this.boundHandleIntersection,
				{ threshold: 0.1 }
			);
			this.state.intersectionObserver.observe( this.elements.wrapper );
		}
	}

	public destroy(): void {
		if ( this.state.destroyed ) return;
		this.state.destroyed = true;
		this.stopAutoplay();

		if ( this.state.observer ) {
			this.state.observer.disconnect();
			this.state.observer = null;
		}
		if ( this.state.intersectionObserver ) {
			this.state.intersectionObserver.disconnect();
			this.state.intersectionObserver = null;
		}

		const { container, prevButton, nextButton, wrapper, indicators } =
			this.elements;

		container.removeEventListener(
			'touchstart',
			this.boundHandleTouchStart
		);
		container.removeEventListener( 'touchmove', this.boundHandleTouchMove );
		container.removeEventListener( 'touchend', this.boundHandleTouchEnd );

		if ( this.config.pauseOnHover ) {
			container.removeEventListener(
				'mouseenter',
				this.boundStopAutoplay
			);
			container.removeEventListener(
				'mouseleave',
				this.boundStartAutoplay
			);
			container.removeEventListener(
				'touchstart',
				this.boundStopAutoplay
			);
			container.removeEventListener(
				'touchend',
				this.boundStartAutoplay
			);
		}

		if ( prevButton ) {
			prevButton.removeEventListener( 'click', this.boundPrevSlide );
		}
		if ( nextButton ) {
			nextButton.removeEventListener( 'click', this.boundNextSlide );
		}

		wrapper.removeEventListener( 'keydown', this.boundHandleKeyboard );
		wrapper.removeEventListener( 'focusin', this.boundHandleFocusIn );
		wrapper.removeEventListener( 'focusout', this.boundHandleFocusOut );

		// Remove indicator listeners
		if ( indicators ) {
			Array.from( indicators.children ).forEach( ( indicator ) => {
				// Clone and replace to remove all listeners effectively
				const newIndicator = indicator.cloneNode( true );
				indicator.parentNode?.replaceChild( newIndicator, indicator );
			} );
			indicators.innerHTML = ''; // Clear out indicators
		}

		SliderBergController.instances.delete( this.id );
		console.log( `SliderBerg instance ${ this.id } destroyed.` );
	}
}

/**
 * Initialize all SliderBerg sliders on the page
 */
function initializeSliders(): void {
	const sliders: NodeListOf< Element > = document.querySelectorAll(
		'.wp-block-sliderberg-sliderberg'
	);
	if ( ! sliders.length ) {
		// console.warn('No SliderBerg sliders found on the page to initialize.');
		return;
	}
	sliders.forEach( ( slider: Element ) => {
		// Check if an instance already exists for this element to prevent re-initialization
		let alreadyInitialized = false;
		SliderBergController.instances.forEach( ( instance ) => {
			if ( instance.elements.wrapper === slider ) {
				alreadyInitialized = true;
			}
		} );
		if ( ! alreadyInitialized ) {
			SliderBergController.createInstance( slider );
		}
	} );
}

// Initialize sliders when the DOM is ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () =>
		setTimeout( initializeSliders, 50 )
	);
} else {
	setTimeout( initializeSliders, 50 ); // Already loaded
}

// Clean up on page unload
window.addEventListener( 'beforeunload', () => {
	SliderBergController.destroyAll();
} );

// Re-initialize on potential AJAX content loads
document.addEventListener( 'DOMContentLoaded', function () {
	if ( typeof jQuery !== 'undefined' ) {
		jQuery( document ).on(
			'ajaxComplete',
			function ( event: any, xhr: any, settings: any ) {
				// Simple check if the response might contain new blocks
				if (
					settings.data &&
					typeof settings.data === 'string' &&
					settings.data.includes( 'action=load-more' )
				) {
					// Example condition
					setTimeout( initializeSliders, 150 ); // Give a bit more time for content to render
				} else if (
					xhr.responseText &&
					xhr.responseText.includes(
						'wp-block-sliderberg-sliderberg'
					)
				) {
					setTimeout( initializeSliders, 150 );
				}
			}
		);
	}
	document.addEventListener( 'content-updated', () =>
		setTimeout( initializeSliders, 150 )
	); // For custom theme events
} );

// Expose to window
window.SliderBerg = {
	init: initializeSliders,
	destroyAll: SliderBergController.destroyAll,
};
