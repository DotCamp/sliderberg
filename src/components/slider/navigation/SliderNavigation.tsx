import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { chevronLeft, chevronRight } from '@wordpress/icons';
import { SlideIndicators } from './SlideIndicators';

interface SliderNavigationProps {
	attributes: any;
	currentSlideId: string | null;
	innerBlocks: any[];
	onSlideChange: ( slideId: string ) => void;
	position: 'top' | 'bottom' | 'split';
}

export const SliderNavigation: React.FC< SliderNavigationProps > = ( {
	attributes,
	currentSlideId,
	innerBlocks,
	onSlideChange,
	position,
} ) => {
	const handlePrevSlide = () => {
		if ( ! currentSlideId || innerBlocks.length === 0 ) return;
		const idx = innerBlocks.findIndex(
			( b: any ) => b.clientId === currentSlideId
		);
		const prevIdx = idx > 0 ? idx - 1 : innerBlocks.length - 1;
		onSlideChange( innerBlocks[ prevIdx ].clientId );
	};

	const handleNextSlide = () => {
		if ( ! currentSlideId || innerBlocks.length === 0 ) return;
		const idx = innerBlocks.findIndex(
			( b: any ) => b.clientId === currentSlideId
		);
		const nextIdx = idx < innerBlocks.length - 1 ? idx + 1 : 0;
		onSlideChange( innerBlocks[ nextIdx ].clientId );
	};

	if ( position === 'split' ) {
		return (
			<>
				<div
					className="sliderberg-navigation"
					data-type={ attributes.navigationType }
					data-placement={ attributes.navigationPlacement }
					style={ { opacity: attributes.navigationOpacity } }
				>
					<div className="sliderberg-nav-controls">
						<Button
							className="sliderberg-nav-button sliderberg-prev"
							onClick={ handlePrevSlide }
							icon={ chevronLeft }
							label={ __( 'Previous Slide', 'sliderberg' ) }
							data-shape={ attributes.navigationShape }
							data-size={ attributes.navigationSize }
							style={ {
								color: attributes.navigationColor,
								backgroundColor: attributes.navigationBgColor,
								...( attributes.navigationType === 'split' && {
									transform: `translateY(calc(-50% + ${ attributes.navigationVerticalPosition }px))`,
									left: `${ attributes.navigationHorizontalPosition }px`,
								} ),
							} }
						/>
						<Button
							className="sliderberg-nav-button sliderberg-next"
							onClick={ handleNextSlide }
							icon={ chevronRight }
							label={ __( 'Next Slide', 'sliderberg' ) }
							data-shape={ attributes.navigationShape }
							data-size={ attributes.navigationSize }
							style={ {
								color: attributes.navigationColor,
								backgroundColor: attributes.navigationBgColor,
								...( attributes.navigationType === 'split' && {
									transform: `translateY(calc(-50% + ${ attributes.navigationVerticalPosition }px))`,
									right: `${ attributes.navigationHorizontalPosition }px`,
								} ),
							} }
						/>
					</div>
				</div>
				<SlideIndicators
					innerBlocks={ innerBlocks }
					currentSlideId={ currentSlideId }
					onSlideChange={ onSlideChange }
					dotColor={ attributes.dotColor }
					dotActiveColor={ attributes.dotActiveColor }
					hideDots={ attributes.hideDots }
				/>
			</>
		);
	}

	// Top or Bottom Navigation
	return (
		<div
			className={ `sliderberg-navigation-bar sliderberg-navigation-bar-${ position }` }
		>
			<div className="sliderberg-nav-controls sliderberg-nav-controls-grouped">
				<Button
					className="sliderberg-nav-button sliderberg-prev"
					onClick={ handlePrevSlide }
					icon={ chevronLeft }
					label={ __( 'Previous Slide', 'sliderberg' ) }
					data-shape={ attributes.navigationShape }
					data-size={ attributes.navigationSize }
					style={ {
						color: attributes.navigationColor,
						backgroundColor: attributes.navigationBgColor,
					} }
				/>
				<SlideIndicators
					innerBlocks={ innerBlocks }
					currentSlideId={ currentSlideId }
					onSlideChange={ onSlideChange }
					dotColor={ attributes.dotColor }
					dotActiveColor={ attributes.dotActiveColor }
					hideDots={ attributes.hideDots }
				/>
				<Button
					className="sliderberg-nav-button sliderberg-next"
					onClick={ handleNextSlide }
					icon={ chevronRight }
					label={ __( 'Next Slide', 'sliderberg' ) }
					data-shape={ attributes.navigationShape }
					data-size={ attributes.navigationSize }
					style={ {
						color: attributes.navigationColor,
						backgroundColor: attributes.navigationBgColor,
					} }
				/>
			</div>
		</div>
	);
};
