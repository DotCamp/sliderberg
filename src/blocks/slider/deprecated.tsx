// src/blocks/slider/deprecated.tsx - Block deprecations

import { InnerBlocks } from '@wordpress/block-editor';
import * as React from 'react';

// Deprecation for v1.0.0 - minimal attributes version
const deprecated_v1 = {
	attributes: {
		customWidth: {
			type: 'string',
			default: '',
		},
		widthUnit: {
			type: 'string',
			default: 'px',
		},
		widthPreset: {
			type: 'string',
			default: 'full',
		},
		isCarouselMode: {
			type: 'boolean',
			default: false,
		},
		slidesToShow: {
			type: 'number',
			default: 3,
		},
		slidesToScroll: {
			type: 'number',
			default: 1,
		},
		slideSpacing: {
			type: 'number',
			default: 20,
		},
		infiniteLoop: {
			type: 'boolean',
			default: true,
		},
	},
	save: () => {
		return <InnerBlocks.Content />;
	},
	migrate: ( attributes: any ) => {
		// Migrate old attributes to new structure
		return {
			// Keep existing attributes
			...attributes,
			// Add new attributes with defaults
			align: 'full',
			type: '',
			autoplay: false,
			autoplaySpeed: 5000,
			pauseOnHover: true,
			transitionEffect: 'slide',
			transitionDuration: 500,
			transitionEasing: 'ease',
			navigationType: 'bottom',
			navigationPlacement: 'overlay',
			navigationShape: 'circle',
			navigationSize: 'medium',
			navigationColor: '#ffffff',
			navigationBgColor: 'rgba(0, 0, 0, 0.5)',
			navigationOpacity: 1,
			navigationVerticalPosition: 20,
			navigationHorizontalPosition: 20,
			dotColor: '#6c757d',
			dotActiveColor: '#ffffff',
			hideDots: false,
		};
	},
};

// Export all deprecations - add more as needed
export default [ deprecated_v1 ];