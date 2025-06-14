import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

interface SliderControlsProps {
	onAddSlide: () => void;
	onDeleteSlide: () => void;
	onDuplicateSlide?: () => void;
	canDelete: boolean;
	currentSlideId: string | null;
}

export const SliderControls: React.FC< SliderControlsProps > = ( {
	onAddSlide,
	onDeleteSlide,
	onDuplicateSlide,
	canDelete,
	currentSlideId,
} ) => {
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
					onClick={ onDuplicateSlide }
					disabled={ ! currentSlideId }
				>
					{ __( 'Duplicate Slide', 'sliderberg' ) }
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
