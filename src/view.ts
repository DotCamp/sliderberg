/**
 * SliderBerg Frontend Entry Point
 * Simplified entry point that uses the refactored modules
 */

import { SliderBergController } from './frontend/slider-controller';

// Keep your existing global declarations and interfaces
declare const jQuery: any;
declare global {
	interface Window {
		SliderBerg: {
			init: () => void;
			destroyAll: () => void;
		};
		wp?: {
			hooks?: {
				applyFilters: ( filter: string, value: any, ...args: any[] ) => any;
			};
		};
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
		return;
	}

	// Allow pro features to extend initialization (only if wp.hooks is available)
	if ( window.wp?.hooks?.applyFilters ) {
		const customInit = window.wp.hooks.applyFilters(
			'sliderberg.frontendInit',
			null,
			sliders
		);

		if ( customInit && typeof customInit === 'function' ) {
			customInit( sliders );
			return;
		}
	}

	sliders.forEach( ( slider: Element ) => {
		// Check if already initialized
		let alreadyInitialized = false;
		SliderBergController.getInstances().forEach( ( instance ) => {
			if ( instance.getElements().wrapper === slider ) {
				alreadyInitialized = true;
			}
		} );

		if ( ! alreadyInitialized ) {
			// Allow pro features to modify slider initialization (only if wp.hooks is available)
			let shouldInit = true;
			if ( window.wp?.hooks?.applyFilters ) {
				shouldInit = window.wp.hooks.applyFilters(
					'sliderberg.beforeSliderInit',
					true,
					slider
				);
			}

			if ( shouldInit ) {
				SliderBergController.createInstance( slider );
			}
		}
	} );
}

// Keep all your existing initialization and event handling code
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', () =>
		setTimeout( initializeSliders, 50 )
	);
} else {
	setTimeout( initializeSliders, 50 );
}

// Keep all existing event listeners and cleanup
window.addEventListener( 'beforeunload', () => {
	SliderBergController.destroyAll();
} );

// Keep existing jQuery integration and content-updated listeners
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
