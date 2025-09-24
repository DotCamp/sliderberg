// src/editor.ts
import { HTMLElementWithDataClientId } from '../types/common';

declare global {
	interface Window {
		updateSliderbergSlidesVisibility?: () => void;
		sliderbergCleanup?: () => void;
		visibilityUpdateTimeout?: number;
	}
}

let observer: MutationObserver | null = null;
let domInsertedHandler: ( ( event: Event ) => void ) | null = null;
let rafId: number | null = null;

function updateSliderbergSlidesVisibility(): void {
	// Cancel any pending animation frame to prevent multiple queued updates
	if ( rafId !== null ) {
		cancelAnimationFrame( rafId );
	}

	// Schedule the DOM updates for the next animation frame
	rafId = requestAnimationFrame( () => {
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
				const isCarouselMode =
					container.closest( '.sliderberg-carousel-mode' ) !== null;

				if ( isCarouselMode ) {
					// In carousel mode, show all slides but mark the current one as active
					slides.forEach( ( slide ) => {
						const slideId = slide.getAttribute( 'data-client-id' );
						slide.style.display = '';
						slide.classList.toggle(
							'active',
							slideId === currentId
						);
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

		// Pro functionality removed - can be extended via hooks/filters in pro version

		// Clear the RAF ID after execution
		rafId = null;
	} );
}

// Cleanup function
function cleanup(): void {
	// Clear timeout
	if ( window.visibilityUpdateTimeout ) {
		clearTimeout( window.visibilityUpdateTimeout );
		window.visibilityUpdateTimeout = undefined;
	}

	// Cancel any pending animation frame
	if ( rafId !== null ) {
		cancelAnimationFrame( rafId );
		rafId = null;
	}

	// Disconnect observer
	if ( observer ) {
		observer.disconnect();
		observer = null;
	}

	// Remove event listeners
	if ( domInsertedHandler ) {
		document.removeEventListener( 'DOMNodeInserted', domInsertedHandler );
		domInsertedHandler = null;
	}

	// Remove DOMContentLoaded listener
	document.removeEventListener(
		'DOMContentLoaded',
		updateSliderbergSlidesVisibility
	);

	// Clear global functions
	delete window.updateSliderbergSlidesVisibility;
	delete window.sliderbergCleanup;
}

// Initialize the visibility update function with cleanup
if ( typeof window !== 'undefined' ) {
	window.updateSliderbergSlidesVisibility = updateSliderbergSlidesVisibility;
	window.sliderbergCleanup = cleanup;

	// Auto-cleanup on page unload
	window.addEventListener( 'beforeunload', () => {
		if ( window.sliderbergCleanup ) {
			window.sliderbergCleanup();
		}
	} );
}

// Run on DOM changes (Gutenberg editor is dynamic)
observer = new MutationObserver( () => {
	// Debounce the visibility update to avoid excessive calls
	if ( window.visibilityUpdateTimeout ) {
		clearTimeout( window.visibilityUpdateTimeout );
	}
	window.visibilityUpdateTimeout = window.setTimeout(
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

// Handle AJAX content updates
domInsertedHandler = ( event: Event ) => {
	const target = event.target as HTMLElement;
	if (
		target &&
		target.classList &&
		target.classList.contains( 'sliderberg-slide' )
	) {
		setTimeout( updateSliderbergSlidesVisibility, 50 );
	}
};

document.addEventListener( 'DOMNodeInserted', domInsertedHandler );

export {}; // Make this file a module
