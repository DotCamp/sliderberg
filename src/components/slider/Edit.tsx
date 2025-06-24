import React, { useEffect } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import type { BlockInstance } from '@wordpress/blocks';

// Import sub-components
import { TypeSelector } from './TypeSelector';
import { SliderContent } from './SliderContent';
import { SliderSettings } from './settings/SliderSettings';
import { useSliderState } from '../../hooks/useSliderState';
import { SliderAttributes } from '../../types/slider';

// Declare wp namespace
declare const wp: {
	data: {
		dispatch: ( store: string ) => {
			removeBlocks: ( clientIds: string[] ) => void;
			insertBlocks: (
				blocks: BlockInstance[],
				index: number,
				rootClientId: string
			) => void;
		};
	};
};

interface EditProps {
	attributes: SliderAttributes;
	setAttributes: ( attrs: Partial< SliderAttributes > ) => void;
	clientId: string;
}

export const Edit: React.FC< EditProps > = ( {
	attributes,
	setAttributes,
	clientId,
} ) => {
	const {
		currentSlideId,
		innerBlocks,
		handleSlideChange,
		handleAddSlide,
		handleDeleteSlide,
		handleDuplicateSlide,
	} = useSliderState( clientId, attributes );

	// Ensure align is always set for custom width to avoid validation errors
	React.useEffect( () => {
		if ( attributes.widthPreset === 'custom' && ! attributes.align ) {
			setAttributes( { align: 'full' } );
		}
	}, [ attributes.widthPreset, attributes.align, setAttributes ] );

	// Pro block auto-insertion removed - can be extended via hooks/filters in pro version
	useEffect( () => {
		// Type change handling can be extended in pro version
	}, [ attributes.type, innerBlocks, clientId ] );

	// Build editor styles - this is the key fix!
	const getEditorStyles = () => {
		const styles: React.CSSProperties & Record< string, string > = {
			'--sliderberg-dot-color': attributes.dotColor,
			'--sliderberg-dot-active-color': attributes.dotActiveColor,
			'--sliderberg-slides-to-show': attributes.slidesToShow || 3,
			'--sliderberg-slide-spacing': `${ attributes.slideSpacing || 20 }px`,
		};

		// Handle custom width in editor
		if ( attributes.widthPreset === 'custom' && attributes.customWidth ) {
			styles[
				'--sliderberg-custom-width'
			] = `${ attributes.customWidth }px`;
			// Apply the width directly in editor
			styles.width = `${ attributes.customWidth }px`;
			styles.maxWidth = `${ attributes.customWidth }px`;
			styles.marginLeft = 'auto';
			styles.marginRight = 'auto';
		}

		// Handle full width in editor - remove padding/margin
		if (
			attributes.widthPreset === 'full' ||
			attributes.align === 'full'
		) {
			styles.width = '100%';
			styles.maxWidth = 'none';
			styles.marginLeft = 'calc(50% - 50vw)';
			styles.marginRight = 'calc(50% - 50vw)';
		}

		// Handle wide alignment
		if (
			attributes.widthPreset === 'wide' ||
			attributes.align === 'wide'
		) {
			styles.width = '100%';
			styles.maxWidth = '1200px'; // Adjust based on your theme
			styles.marginLeft = 'auto';
			styles.marginRight = 'auto';
		}

		return styles;
	};

	const blockProps = useBlockProps( {
		style: getEditorStyles(),
		'data-width-preset': attributes.widthPreset,
		'data-type': attributes.type,
		className: `sliderberg-editor-wrapper ${
			attributes.widthPreset === 'full' || attributes.align === 'full'
				? 'is-full-width'
				: ''
		} ${ attributes.isCarouselMode ? 'is-carousel-mode' : '' }`,
	} );

	// Update visibility when type changes
	useEffect( () => {
		if (
			attributes.type &&
			typeof window !== 'undefined' &&
			window.updateSliderbergSlidesVisibility
		) {
			window.updateSliderbergSlidesVisibility();
		}
	}, [ attributes.type ] );

	const handleTypeSelect = ( typeId: string ) => {
		// Set the type for any slider type (including pro types)
		setAttributes( { type: typeId } );

		// Force visibility update after type selection
		setTimeout( () => {
			if (
				typeof window !== 'undefined' &&
				window.updateSliderbergSlidesVisibility
			) {
				window.updateSliderbergSlidesVisibility();
			}
		}, 10 );
	};

	// Check if we have pro blocks as children
	const hasProChild = innerBlocks.some(
		( block: BlockInstance ) =>
			block.name === 'sliderberg-pro/posts-slider' ||
			block.name === 'sliderberg-pro/woo-products'
	);

	// Check if it's a pro slider type or has pro children
	const isProSliderType =
		[ 'posts-slider', 'woo-products' ].includes( attributes.type ) ||
		hasProChild;

	return (
		<div { ...blockProps }>
			<SliderSettings
				attributes={ attributes }
				setAttributes={ setAttributes }
			/>

			{ ! attributes.type && ! hasProChild ? (
				<TypeSelector onTypeSelect={ handleTypeSelect } />
			) : isProSliderType ? (
				// Render pro slider content with settings intact
				<>
					{ /* Render the pro slider content - it will be the child blocks */ }
					<SliderContent
						attributes={ attributes }
						currentSlideId={ currentSlideId }
						innerBlocks={ innerBlocks }
						onAddSlide={ handleAddSlide }
						onDeleteSlide={ handleDeleteSlide }
						onDuplicateSlide={ handleDuplicateSlide }
						onSlideChange={ handleSlideChange }
						clientId={ clientId }
					/>
				</>
			) : (
				// Render regular blocks slider
				<SliderContent
					attributes={ attributes }
					currentSlideId={ currentSlideId }
					innerBlocks={ innerBlocks }
					onAddSlide={ handleAddSlide }
					onDeleteSlide={ handleDeleteSlide }
					onDuplicateSlide={ handleDuplicateSlide }
					onSlideChange={ handleSlideChange }
					clientId={ clientId }
				/>
			) }
		</div>
	);
};
