// src/components/slider/SliderContent.tsx
import React, { useEffect, useState, useRef } from 'react';
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { SliderNavigation } from './navigation/SliderNavigation';
import { SliderControls } from './SliderControls';
import classnames from 'classnames';

// Allow slide blocks
const ALLOWED_BLOCKS = [ 'sliderberg/slide' ];

interface SliderContentProps {
	attributes: {
		isCarouselMode: boolean;
		slidesToShow: number;
		slidesToScroll: number;
		slideSpacing: number;
		infiniteLoop: boolean;
		type: string;
		navigationType: string;
		// ... other existing attributes
	};
	currentSlideId: string | null;
	innerBlocks: any[];
	onAddSlide: () => void;
	onDeleteSlide: () => void;
	onDuplicateSlide: ( slideId: string ) => void;
	onSlideChange: ( slideId: string ) => void;
	clientId: string;
}

export const SliderContent: React.FC< SliderContentProps > = ( {
	attributes,
	currentSlideId,
	innerBlocks,
	onAddSlide,
	onDeleteSlide,
	onDuplicateSlide,
	onSlideChange,
	clientId,
} ) => {
	const {
		isCarouselMode,
		slidesToShow,
		slidesToScroll,
		slideSpacing,
		infiniteLoop,
	} = attributes;

	// Pro state removed - can be extended via hooks/filters in pro version

	// Check if we have pro blocks
	// Only show slide blocks
	const hasRegularSlides = innerBlocks.some(
		( block ) => block.name === 'sliderberg/slide'
	);

	// Pro functionality removed - can be extended via hooks/filters in pro version

	// Determine what navigation to show
	const showRegularNavigation = hasRegularSlides;
	const showProNavigation = false; // Pro navigation removed

	// Show slide controls for regular blocks
	const showSlideControls = hasRegularSlides || attributes.type === 'blocks';

	// Determine the template based on the type
	let template: any[] | undefined;
	const templateLock: string | false = false;

	if ( attributes.type === 'blocks' && innerBlocks.length === 0 ) {
		// Only add default slide template for blocks type when there are no blocks
		template = [ [ 'sliderberg/slide', {} ] ];
	}

	// Calculate visible slides for carousel mode
	const getVisibleSlides = () => {
		if ( ! isCarouselMode ) return [ currentSlideId ];

		const currentIndex = innerBlocks.findIndex(
			( block ) => block.clientId === currentSlideId
		);

		if ( currentIndex === -1 ) return [];

		const visibleSlides = [];
		const totalSlides = innerBlocks.length;

		for ( let i = 0; i < slidesToShow; i++ ) {
			let slideIndex = currentIndex + i;

			if ( infiniteLoop ) {
				slideIndex = ( slideIndex + totalSlides ) % totalSlides;
			} else if ( slideIndex >= totalSlides ) {
				break;
			}

			visibleSlides.push( innerBlocks[ slideIndex ].clientId );
		}

		return visibleSlides;
	};

	// Calculate start index for carousel mode (like frontend)
	const getStartIndex = () => {
		if ( ! isCarouselMode ) return 0;

		const currentIndex = innerBlocks.findIndex(
			( block ) => block.clientId === currentSlideId
		);

		return currentIndex >= 0 ? currentIndex : 0;
	};

	const visibleSlideIds = getVisibleSlides();

	// Update slide visibility
	useEffect( () => {
		if (
			typeof window !== 'undefined' &&
			window.updateSliderbergSlidesVisibility
		) {
			window.updateSliderbergSlidesVisibility();
		}
	}, [ currentSlideId, isCarouselMode, slidesToShow, slidesToScroll ] );

	// Ref for the block list layout (slides row)
	const blockListLayoutRef = useRef< HTMLDivElement | null >( null );

	// Find the index of the current slide
	const currentIndex = innerBlocks.findIndex(
		( block ) => block.clientId === currentSlideId
	);

	// Get start index for carousel mode
	const startIndex = getStartIndex();

	// Carousel scroll effect in editor
	useEffect( () => {
		if ( ! isCarouselMode ) return;
		// Find the .block-editor-block-list__layout inside the slides container with the correct path
		const container = document.querySelector(
			`.sliderberg-slides-container[data-slider-id="${ clientId }"]`
		);
		if ( ! container ) return;
		const layout = container.querySelector(
			'.block-editor-inner-blocks .block-editor-block-list__layout'
		) as HTMLElement | null;
		if ( ! layout ) return;
		// Calculate offset percentage based on start index like frontend
		const offset =
			startIndex > -1 ? -( startIndex * ( 100 / slidesToShow ) ) : 0;
		layout.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
		layout.style.transform = `translateX(${ offset }%)`;
	}, [ startIndex, slidesToShow, isCarouselMode, clientId ] );

	// Add click-to-select functionality for carousel mode
	useEffect( () => {
		if ( ! isCarouselMode || slidesToShow <= 1 ) return;

		const container = document.querySelector(
			`.sliderberg-slides-container[data-slider-id="${ clientId }"]`
		);
		if ( ! container ) return;

		const slideBlocks = container.querySelectorAll(
			'.block-editor-inner-blocks .block-editor-block-list__layout > .block-editor-block-list__block'
		);

		const handleSlideClick = ( event: Event ) => {
			const target = event.target as HTMLElement;
			const slideBlock = target.closest(
				'.block-editor-block-list__block'
			);

			if ( slideBlock ) {
				const slideId = slideBlock.getAttribute( 'data-client-id' );
				if ( slideId && slideId !== currentSlideId ) {
					onSlideChange( slideId );
					// Prevent the click from triggering block selection
					event.stopPropagation();
				}
			}
		};

		slideBlocks.forEach( ( slideBlock ) => {
			slideBlock.addEventListener( 'click', handleSlideClick );
		} );

		// Cleanup
		return () => {
			slideBlocks.forEach( ( slideBlock ) => {
				slideBlock.removeEventListener( 'click', handleSlideClick );
			} );
		};
	}, [
		isCarouselMode,
		slidesToShow,
		clientId,
		currentSlideId,
		onSlideChange,
	] );

	return (
		<>
			{ showSlideControls && (
				<SliderControls
					onAddSlide={ onAddSlide }
					onDeleteSlide={ onDeleteSlide }
					onDuplicateSlide={ ( slideId?: string ) => {
						const targetSlideId = slideId || currentSlideId;
						if ( targetSlideId ) {
							onDuplicateSlide( targetSlideId );
						}
					} }
					canDelete={ innerBlocks.length > 1 }
					currentSlideId={ currentSlideId }
					isCarouselMode={ isCarouselMode }
					slidesToShow={ slidesToShow }
					innerBlocks={ innerBlocks }
				/>
			) }

			{ attributes.navigationType === 'top' && showRegularNavigation && (
				<SliderNavigation
					attributes={ attributes }
					currentSlideId={ currentSlideId }
					innerBlocks={ innerBlocks.filter(
						( block ) => block.name === 'sliderberg/slide'
					) }
					onSlideChange={ onSlideChange }
					position="top"
					sliderId={ clientId }
				/>
			) }

			{ /* Pro navigation removed - can be extended via hooks/filters in pro version */ }

			<div
				className={ classnames( 'sliderberg-slides', {
					'sliderberg-carousel-mode': isCarouselMode,
				} ) }
			>
				<div
					className="sliderberg-slides-container"
					data-current-slide-id={ currentSlideId || '' }
					data-slider-id={ clientId }
					style={
						{
							'--sliderberg-slides-to-show': slidesToShow,
							'--sliderberg-slide-spacing': `${ slideSpacing }px`,
						} as React.CSSProperties
					}
				>
					<InnerBlocks
						allowedBlocks={ ALLOWED_BLOCKS }
						template={ template }
						templateLock={ templateLock }
						orientation={
							isCarouselMode ? 'horizontal' : 'vertical'
						}
					/>
				</div>
			</div>

			{ attributes.navigationType === 'split' &&
				showRegularNavigation && (
					<SliderNavigation
						attributes={ attributes }
						currentSlideId={ currentSlideId }
						innerBlocks={ innerBlocks.filter(
							( block ) => block.name === 'sliderberg/slide'
						) }
						onSlideChange={ onSlideChange }
						position="split"
						sliderId={ clientId }
					/>
				) }

			{ /* Pro navigation removed - can be extended via hooks/filters in pro version */ }

			{ attributes.navigationType === 'bottom' &&
				showRegularNavigation && (
					<SliderNavigation
						attributes={ attributes }
						currentSlideId={ currentSlideId }
						innerBlocks={ innerBlocks.filter(
							( block ) => block.name === 'sliderberg/slide'
						) }
						onSlideChange={ onSlideChange }
						position="bottom"
						sliderId={ clientId }
					/>
				) }

			{ /* Pro navigation removed - can be extended via hooks/filters in pro version */ }
		</>
	);
};
