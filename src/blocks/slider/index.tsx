// src/blocks/slider/index.tsx - Updated registration

import { registerBlockType } from '@wordpress/blocks';
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
import * as React from 'react';

// Import styles
import './style.css';
import './editor.css';

// Import components - keep existing edit component
import { Edit } from './edit';

// Import deprecations
import deprecated from './deprecated';

// Import slide block
import '../slide';

// Allow pro features to add type-specific attributes
const typeAttributes = applyFilters( 'sliderberg.blockAttributes', {} ) as Record<string, any>;

// Register the main block
registerBlockType( 'sliderberg/sliderberg', {
	title: __( 'SliderBerg', 'sliderberg' ),
	description: __( 'Add a beautiful slider to your content.', 'sliderberg' ),
	category: 'widgets',
	icon: 'slides',
	supports: {
		html: false,
		align: [ 'wide', 'full' ],
		alignWide: true,
		fullWidth: true,
	},
	attributes: {
		align: {
			type: 'string',
			default: 'full',
		},
		type: {
			type: 'string',
			default: '',
		},
		autoplay: {
			type: 'boolean',
			default: false,
		},
		autoplaySpeed: {
			type: 'number',
			default: 5000,
		},
		pauseOnHover: {
			type: 'boolean',
			default: true,
		},
		transitionEffect: {
			type: 'string',
			default: 'slide',
		},
		transitionDuration: {
			type: 'number',
			default: 500,
		},
		transitionEasing: {
			type: 'string',
			default: 'ease',
		},
		navigationType: {
			type: 'string',
			default: 'bottom',
		},
		navigationPlacement: {
			type: 'string',
			default: 'overlay',
		},
		navigationShape: {
			type: 'string',
			default: 'circle',
		},
		navigationSize: {
			type: 'string',
			default: 'medium',
		},
		navigationColor: {
			type: 'string',
			default: '#ffffff',
		},
		navigationBgColor: {
			type: 'string',
			default: 'rgba(0, 0, 0, 0.5)',
		},
		navigationOpacity: {
			type: 'number',
			default: 1,
		},
		navigationVerticalPosition: {
			type: 'number',
			default: 20,
		},
		navigationHorizontalPosition: {
			type: 'number',
			default: 20,
		},
		dotColor: {
			type: 'string',
			default: '#6c757d',
		},
		dotActiveColor: {
			type: 'string',
			default: '#ffffff',
		},
		hideDots: {
			type: 'boolean',
			default: false,
		},
		widthPreset: {
			type: 'string',
			default: 'full',
		},
		customWidth: {
			type: 'string',
			default: '',
		},
		widthUnit: {
			type: 'string',
			default: 'px',
		},
		// Carousel attributes
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
		// Responsive carousel attributes
		tabletSlidesToShow: {
			type: 'number',
			default: 2,
		},
		tabletSlidesToScroll: {
			type: 'number',
			default: 1,
		},
		tabletSlideSpacing: {
			type: 'number',
			default: 15,
		},
		mobileSlidesToShow: {
			type: 'number',
			default: 1,
		},
		mobileSlidesToScroll: {
			type: 'number',
			default: 1,
		},
		mobileSlideSpacing: {
			type: 'number',
			default: 10,
		},
		// Merge type-specific attributes
		...typeAttributes,
	},
	edit: Edit,
	save: () => {
		return <InnerBlocks.Content />;
	},
	deprecated,
} );
