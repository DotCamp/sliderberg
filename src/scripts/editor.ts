// src/editor.ts
import { HTMLElementWithDataClientId } from '../types/common';

declare global {
	interface Window {
		updateSliderbergSlidesVisibility: () => void;
	}
}

function updateSliderbergSlidesVisibility(): void {
	// Handle regular slide blocks
	document
		.querySelectorAll< HTMLElementWithDataClientId >(
			'.sliderberg-slides-container[data-current-slide-id]'
		)
		.forEach( ( container ) => {
			const currentId: string | null = container.getAttribute(
				'data-current-slide-id'
			);
			const slides: HTMLElementWithDataClientId[] = Array.from(
				container.querySelectorAll< HTMLElementWithDataClientId >(
					'.sliderberg-slide'
				)
			);

			// Check if carousel mode is enabled
			const isCarouselMode = container.closest('.sliderberg-carousel-mode') !== null;

			if (isCarouselMode) {
				// In carousel mode, show all slides but mark the current one as active
				slides.forEach( ( slide ) => {
					const slideId = slide.getAttribute( 'data-client-id' );
					slide.style.display = '';
					slide.classList.toggle( 'active', slideId === currentId );
				} );
			} else {
				// In regular mode, only show the current slide
				slides.forEach( ( slide ) => {
					slide.style.display =
						slide.getAttribute( 'data-client-id' ) === currentId
							? ''
							: 'none';
				} );
			}
		} );

	// Handle pro slides (posts slider, etc.)
	document
		.querySelectorAll< HTMLElement >( '.sliderberg-posts-slider-wrapper' )
		.forEach( ( wrapper ) => {
			const postSlides = Array.from(
				wrapper.querySelectorAll< HTMLElement >(
					'.sliderberg-post-slide'
				)
			);

			if ( postSlides.length > 0 ) {
				// Check if any slide is already marked as active
				const activeSlide = postSlides.find(
					( slide ) =>
						slide.getAttribute( 'data-is-active' ) === 'true'
				);

				if ( activeSlide ) {
					// Respect the current active state
					postSlides.forEach( ( slide ) => {
						const isActive =
							slide.getAttribute( 'data-is-active' ) === 'true';
						slide.style.display = isActive ? 'block' : 'none';
					} );
				} else {
					// Only if no active slide is set, show the first one
					postSlides.forEach( ( slide, index ) => {
						const isFirst = index === 0;
						slide.style.display = isFirst ? 'block' : 'none';
						slide.setAttribute(
							'data-is-active',
							isFirst ? 'true' : 'false'
						);
					} );
				}
			}
		} );

	// Handle other pro slider types if they exist
	document
		.querySelectorAll< HTMLElement >( '.sliderberg-woo-products-wrapper' )
		.forEach( ( wrapper ) => {
			const productSlides = Array.from(
				wrapper.querySelectorAll< HTMLElement >(
					'.sliderberg-product-slide'
				)
			);

			if ( productSlides.length > 0 ) {
				// Show only the first product slide, hide others
				productSlides.forEach( ( slide, index ) => {
					slide.style.display = index === 0 ? 'block' : 'none';
				} );
			}
		} );
}

// Initialize the visibility update function
if (typeof window !== 'undefined') {
	window.updateSliderbergSlidesVisibility = updateSliderbergSlidesVisibility;
}

// Run on DOM changes (Gutenberg editor is dynamic)
const observer: MutationObserver = new MutationObserver( () => {
	// Debounce the visibility update to avoid excessive calls
	clearTimeout( ( window as any ).visibilityUpdateTimeout );
	( window as any ).visibilityUpdateTimeout = setTimeout(
		updateSliderbergSlidesVisibility,
		100
	);
} );

observer.observe( document.body, {
	childList: true,
	subtree: true,
	attributes: true,
	attributeFilter: [ 'data-current-slide-id' ],
} );

// Also run on load
document.addEventListener(
	'DOMContentLoaded',
	updateSliderbergSlidesVisibility
);

// Handle AJAX content updates (for dynamic post loading)
document.addEventListener( 'DOMNodeInserted', ( event ) => {
	const target = event.target as HTMLElement;
	if (
		target &&
		target.classList &&
		( target.classList.contains( 'sliderberg-post-slide' ) ||
			target.classList.contains( 'sliderberg-posts-slider-wrapper' ) )
	) {
		setTimeout( updateSliderbergSlidesVisibility, 50 );
	}
} );

export {}; // Make this file a module
