import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

interface SliderControlsProps {
	onAddSlide: () => void;
	onDeleteSlide: () => void;
	onDuplicateSlide?: ( slideId?: string ) => void;
	canDelete: boolean;
	currentSlideId: string | null;
	// Add new props for carousel mode
	isCarouselMode?: boolean;
	slidesToShow?: number;
	innerBlocks?: any[];
}

export const SliderControls: React.FC< SliderControlsProps > = ( {
	onAddSlide,
	onDeleteSlide,
	onDuplicateSlide,
	canDelete,
	currentSlideId,
	isCarouselMode = false,
	slidesToShow = 1,
	innerBlocks = [],
} ) => {
	// Get the current slide index for better button text
	const currentSlideIndex = innerBlocks.findIndex(
		( block ) => block.clientId === currentSlideId
	);
	const slideNumber = currentSlideIndex >= 0 ? currentSlideIndex + 1 : 0;

	// Determine duplicate button text based on mode
	const getDuplicateButtonText = () => {
		if ( ! isCarouselMode || slidesToShow <= 1 ) {
			return __( 'Duplicate Slide', 'sliderberg' );
		}
		
		// In carousel mode, show which slide will be duplicated
		return __( `Duplicate Slide ${ slideNumber }`, 'sliderberg' );
	};

	// Handle duplicate with optional slide ID
	const handleDuplicate = ( slideId?: string ) => {
		const targetSlideId = slideId || currentSlideId;
		if ( targetSlideId && onDuplicateSlide ) {
			onDuplicateSlide( targetSlideId );
		}
	};

	return (
		<div className="sliderberg-action-buttons">
			<Button
				variant="primary"
				className="sliderberg-add-slide"
				onClick={ onAddSlide }
			>
				{ __( 'Add Slide', 'sliderberg' ) }
			</Button>
			{ onDuplicateSlide && (
				<Button
					variant="secondary"
					className="sliderberg-duplicate-slide"
					onClick={ () => handleDuplicate() }
					disabled={ ! currentSlideId }
					title={
						isCarouselMode && slidesToShow > 1
							? __( `Will duplicate slide ${ slideNumber } of ${ innerBlocks.length }`, 'sliderberg' )
							: __( 'Duplicate the current slide', 'sliderberg' )
					}
				>
					{ getDuplicateButtonText() }
				</Button>
			) }
			<Button
				variant="secondary"
				className="sliderberg-delete-slide"
				onClick={ onDeleteSlide }
				disabled={ ! canDelete }
				isDestructive
			>
				{ __( 'Delete Slide', 'sliderberg' ) }
			</Button>
		</div>
	);
};
