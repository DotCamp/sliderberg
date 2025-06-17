/**
 * Animation handler for SliderBerg
 * Manages all slide transitions and animations
 */

import { SliderConfig, SliderState, SliderElements } from './types';

export class AnimationHandler {
	private config: SliderConfig;
	private state: SliderState;
	private elements: SliderElements;
	private activeTimeouts: Set< number > = new Set();

	constructor(
		config: SliderConfig,
		state: SliderState,
		elements: SliderElements
	) {
		this.config = config;
		this.state = state;
		this.elements = elements;
	}

	/**
	 * Safe setTimeout that tracks timer IDs for cleanup
	 * @param callback
	 * @param delay
	 */
	private safeSetTimeout( callback: () => void, delay: number ): number {
		const timeoutId = window.setTimeout( () => {
			this.activeTimeouts.delete( timeoutId );
			if ( ! this.state.destroyed ) {
				callback();
			}
		}, delay );
		this.activeTimeouts.add( timeoutId );
		return timeoutId;
	}

	/**
	 * Cleanup all active timers
	 */
	cleanup(): void {
		// Clear all active timers
		this.activeTimeouts.forEach( ( id ) => clearTimeout( id ) );
		this.activeTimeouts.clear();
	}

	/**
	 * Sets up the initial slider layout based on configuration
	 */
	setupSliderLayout(): void {
		const { container, slides } = this.elements;
		const { transitionEffect, isCarouselMode, infiniteLoop } = this.config;

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

	/**
	 * Handles slide transition animations
	 * @param index
	 * @param direction
	 */
	handleSlideTransition(
		index: number,
		direction: 'next' | 'prev' | null
	): void {
		const { transitionEffect, isCarouselMode, infiniteLoop } = this.config;

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
					// eslint-disable-next-line no-unused-expressions
					// eslint-disable-next-line no-unused-expressions
					container.offsetHeight;
					container.style.transition = `transform ${ this.getTransitionString() }`;
				} else if ( targetIndex >= totalSlides ) {
					this.state.startIndex = 0;
					container.style.transition = 'none';
					container.style.transform = `translateX(-${
						cloneCount * ( 100 / slidesToShow )
					}%)`;
					// eslint-disable-next-line no-unused-expressions
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
	}

	/**
	 * Handles next slide transition with infinite loop logic
	 */
	handleNextSlideTransition(): void {
		const { container, slides } = this.elements;
		const { transitionDuration } = this.config;

		this.state.currentSlide++;
		container.style.transition = `transform ${ this.getTransitionString() }`;
		container.style.transform = `translateX(-${
			this.state.currentSlide * 100
		}%)`;

		if ( this.state.currentSlide === slides.length + 1 ) {
			// Moved to the clone of the first slide
			this.safeSetTimeout( () => {
				container.style.transition = 'none';
				this.state.currentSlide = 1; // Jump to the real first slide
				container.style.transform = `translateX(-${
					this.state.currentSlide * 100
				}%)`;
				// Force reflow
				// eslint-disable-next-line no-unused-expressions
				container.offsetHeight;
				this.safeSetTimeout( () => {
					container.style.transition = `transform ${ this.getTransitionString() }`;
					this.state.isAnimating = false;
				}, 10 ); // Small delay before restoring transition
			}, transitionDuration );
		} else {
			this.scheduleAnimationReset();
		}
	}

	/**
	 * Handles previous slide transition with infinite loop logic
	 */
	handlePrevSlideTransition(): void {
		const { container, slides } = this.elements;
		const { transitionDuration } = this.config;

		this.state.currentSlide--;
		container.style.transition = `transform ${ this.getTransitionString() }`;
		container.style.transform = `translateX(-${
			this.state.currentSlide * 100
		}%)`;

		if ( this.state.currentSlide === 0 ) {
			// Moved to the clone of the last slide
			this.safeSetTimeout( () => {
				container.style.transition = 'none';
				this.state.currentSlide = slides.length; // Jump to the real last slide
				container.style.transform = `translateX(-${
					this.state.currentSlide * 100
				}%)`;
				// Force reflow
				// eslint-disable-next-line no-unused-expressions
				container.offsetHeight;
				this.safeSetTimeout( () => {
					container.style.transition = `transform ${ this.getTransitionString() }`;
					this.state.isAnimating = false;
				}, 10 ); // Small delay
			}, transitionDuration );
		} else {
			this.scheduleAnimationReset();
		}
	}

	/**
	 * Handles fade and zoom transition effects
	 * @param index
	 * @param direction
	 * @param previousSlideActualIndex
	 */
	handleFadeOrZoomTransition(
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

		// Force reflow
		// eslint-disable-next-line no-unused-expressions
		currentSlideElement.offsetHeight;

		currentSlideElement.style.opacity = '1';
		if ( transitionEffect === 'zoom' ) {
			currentSlideElement.style.transform = 'scale(1)';
		}

		this.updateContainerHeight();
		this.scheduleAnimationReset();
	}

	/**
	 * Updates container height for fade/zoom modes
	 */
	updateContainerHeight(): void {
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

	/**
	 * Sets up clone slides for infinite scrolling
	 */
	setupCloneSlides(): void {
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

	/**
	 * Sets up fade or zoom layout
	 */
	setupFadeOrZoomLayout(): void {
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

	/**
	 * Schedules animation reset after transition
	 */
	scheduleAnimationReset(): void {
		this.safeSetTimeout( () => {
			this.state.isAnimating = false;
		}, this.config.transitionDuration + 50 ); // Add a small buffer
	}

	/**
	 * Gets transition string for CSS
	 */
	getTransitionString(): string {
		const { transitionDuration, transitionEasing } = this.config;
		return `${ transitionDuration }ms ${ transitionEasing }`;
	}

	/**
	 * Gets responsive settings based on viewport
	 */
	getResponsiveSettings(): {
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
}
