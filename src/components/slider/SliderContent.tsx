// src/components/slider/SliderContent.tsx
import React, { useEffect, useState, useRef } from 'react';
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { SliderNavigation } from './navigation/SliderNavigation';
import { SliderControls } from './SliderControls';
import classnames from 'classnames';

// Allow both regular slides and pro slider blocks
const ALLOWED_BLOCKS = [
	'sliderberg/slide',
	'sliderberg-pro/posts-slider',
	'sliderberg-pro/woo-products',
];

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
	onDuplicateSlide: (slideId: string) => void;
	onSlideChange: (slideId: string) => void;
	clientId: string;
}

export const SliderContent: React.FC<SliderContentProps> = ({
	attributes,
	currentSlideId,
	innerBlocks,
	onAddSlide,
	onDeleteSlide,
	onDuplicateSlide,
	onSlideChange,
	clientId,
}) => {
	const {
		isCarouselMode,
		slidesToShow,
		slidesToScroll,
		slideSpacing,
		infiniteLoop,
	} = attributes;

	const [ proSlides, setProSlides ] = useState< HTMLElement[] >( [] );
	const [ currentProSlideIndex, setCurrentProSlideIndex ] = useState( 0 );

	// Check if we have pro blocks
	const hasProBlocks = innerBlocks.some(
		( block ) =>
			block.name === 'sliderberg-pro/posts-slider' ||
			block.name === 'sliderberg-pro/woo-products'
	);

	// Only show slide blocks
	const hasRegularSlides = innerBlocks.some(
		( block ) => block.name === 'sliderberg/slide'
	);

	// For pro blocks, we need to find the actual slide elements and manage navigation
	useEffect( () => {
		if ( hasProBlocks ) {
			const timer = setTimeout( () => {
				const proSlideElements = document.querySelectorAll(
					'.sliderberg-post-slide'
				) as NodeListOf< HTMLElement >;
				if ( proSlideElements.length > 0 ) {
					setProSlides( Array.from( proSlideElements ) );

					// Check if any slide is already marked as active, otherwise show first
					const activeSlide = Array.from( proSlideElements ).find(
						( slide ) =>
							slide.getAttribute( 'data-is-active' ) === 'true'
					);

					if ( activeSlide ) {
						const activeIndex =
							Array.from( proSlideElements ).indexOf(
								activeSlide
							);
						setCurrentProSlideIndex( activeIndex );
					} else {
						// Show only the first slide initially and mark it as active
						proSlideElements.forEach( ( slide, index ) => {
							const isFirst = index === 0;
							slide.style.display = isFirst ? 'block' : 'none';
							slide.setAttribute(
								'data-is-active',
								isFirst ? 'true' : 'false'
							);
						} );
						setCurrentProSlideIndex( 0 );
					}
				}
			}, 200 ); // Give time for posts to load

			return () => clearTimeout( timer );
		}
	}, [ hasProBlocks, innerBlocks ] );

	// Handle pro slide navigation
	const handleProSlideChange = ( index: number ) => {
		if ( proSlides.length === 0 ) return;

		setCurrentProSlideIndex( index );
		proSlides.forEach( ( slide, slideIndex ) => {
			slide.style.display = slideIndex === index ? 'block' : 'none';
			// Add a data attribute to track the current state
			slide.setAttribute(
				'data-is-active',
				slideIndex === index ? 'true' : 'false'
			);
		} );
	};

	// Create mock inner blocks for pro slides to work with navigation
	const mockProBlocks = proSlides.map( ( _, index ) => ( {
		clientId: `pro-slide-${ index }`,
		name: 'sliderberg-pro/post-slide',
	} ) );

	// Determine what navigation to show
	const showRegularNavigation = ! hasProBlocks && hasRegularSlides;
	const showProNavigation = hasProBlocks && proSlides.length > 1;

	// For pro blocks, we don't show the slide controls since they have their own content
	const showSlideControls =
		! hasProBlocks && ( hasRegularSlides || attributes.type === 'blocks' );

	// Determine the template based on the type
	let template: any[] | undefined;
	const templateLock: string | false = false;

	if ( attributes.type === 'blocks' && innerBlocks.length === 0 ) {
		// Only add default slide template for blocks type when there are no blocks
		template = [ [ 'sliderberg/slide', {} ] ];
	} else if ( hasProBlocks ) {
		// For pro blocks, don't set any template
		template = undefined;
	}

	// Calculate visible slides for carousel mode
	const getVisibleSlides = () => {
		if (!isCarouselMode) return [currentSlideId];

		const currentIndex = innerBlocks.findIndex(
			(block) => block.clientId === currentSlideId
		);

		if (currentIndex === -1) return [];

		const visibleSlides = [];
		const totalSlides = innerBlocks.length;

		for (let i = 0; i < slidesToShow; i++) {
			let slideIndex = currentIndex + i;
			
			if (infiniteLoop) {
				slideIndex = (slideIndex + totalSlides) % totalSlides;
			} else if (slideIndex >= totalSlides) {
				break;
			}

			visibleSlides.push(innerBlocks[slideIndex].clientId);
		}

		return visibleSlides;
	};

	// Calculate start index for carousel mode (like frontend)
	const getStartIndex = () => {
		if (!isCarouselMode) return 0;
		
		const currentIndex = innerBlocks.findIndex(
			(block) => block.clientId === currentSlideId
		);
		
		return currentIndex >= 0 ? currentIndex : 0;
	};

	const visibleSlideIds = getVisibleSlides();

	// Update slide visibility
	useEffect(() => {
		if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
			window.updateSliderbergSlidesVisibility();
		}
	}, [currentSlideId, isCarouselMode, slidesToShow, slidesToScroll]);

	// Ref for the block list layout (slides row)
	const blockListLayoutRef = useRef<HTMLDivElement | null>(null);

	// Find the index of the current slide
	const currentIndex = innerBlocks.findIndex(
		(block) => block.clientId === currentSlideId
	);

	// Get start index for carousel mode
	const startIndex = getStartIndex();

	// Carousel scroll effect in editor
	useEffect(() => {
		if (!isCarouselMode) return;
		// Find the .block-editor-block-list__layout inside the slides container with the correct path
		const container = document.querySelector(`.sliderberg-slides-container[data-slider-id="${clientId}"]`);
		if (!container) return;
		const layout = container.querySelector('.block-editor-inner-blocks .block-editor-block-list__layout') as HTMLElement | null;
		if (!layout) return;
		// Calculate offset percentage based on start index like frontend
		const offset = startIndex > -1 ? -(startIndex * (100 / slidesToShow)) : 0;
		layout.style.transition = 'transform 0.4s cubic-bezier(0.4,0,0.2,1)';
		layout.style.transform = `translateX(${offset}%)`;
	}, [startIndex, slidesToShow, isCarouselMode, clientId]);

	return (
		<>
			{ showSlideControls && (
				<SliderControls
					onAddSlide={ onAddSlide }
					onDeleteSlide={ onDeleteSlide }
					onDuplicateSlide={ () => {
						if ( currentSlideId ) {
							onDuplicateSlide( currentSlideId );
						}
					} }
					canDelete={ innerBlocks.length > 1 }
					currentSlideId={ currentSlideId }
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
					sliderId={clientId}
				/>
			) }

			{ attributes.navigationType === 'top' && showProNavigation && (
				<SliderNavigation
					attributes={ attributes }
					currentSlideId={ `pro-slide-${ currentProSlideIndex }` }
					innerBlocks={ mockProBlocks }
					onSlideChange={ ( slideId ) => {
						const index = parseInt(
							slideId.replace( 'pro-slide-', '' )
						);
						handleProSlideChange( index );
					} }
					position="top"
					sliderId={clientId}
				/>
			) }

			<div className={classnames('sliderberg-slides', {
				'sliderberg-carousel-mode': isCarouselMode,
			})}>
				<div
					className="sliderberg-slides-container"
					data-current-slide-id={currentSlideId || ''}
					data-slider-id={clientId}
					style={{
						'--sliderberg-slides-to-show': slidesToShow,
						'--sliderberg-slide-spacing': `${slideSpacing}px`,
					} as React.CSSProperties}
				>
					<InnerBlocks
						allowedBlocks={ALLOWED_BLOCKS}
						template={template}
						templateLock={templateLock}
						orientation={isCarouselMode ? "horizontal" : "vertical"}
					/>
				</div>
			</div>

			{ attributes.navigationType === 'split' && showRegularNavigation && (
				<SliderNavigation
					attributes={attributes}
					currentSlideId={currentSlideId}
					innerBlocks={innerBlocks.filter(
						(block) => block.name === 'sliderberg/slide'
					)}
					onSlideChange={onSlideChange}
					position="split"
					sliderId={clientId}
				/>
			)}

			{ attributes.navigationType === 'split' && showProNavigation && (
				<SliderNavigation
					attributes={attributes}
					currentSlideId={`pro-slide-${currentProSlideIndex}`}
					innerBlocks={mockProBlocks}
					onSlideChange={(slideId) => {
						const index = parseInt(
							slideId.replace('pro-slide-', '')
						);
						handleProSlideChange(index);
					}}
					position="split"
					sliderId={clientId}
				/>
			)}

			{ attributes.navigationType === 'bottom' && showRegularNavigation && (
				<SliderNavigation
					attributes={attributes}
					currentSlideId={currentSlideId}
					innerBlocks={innerBlocks.filter(
						(block) => block.name === 'sliderberg/slide'
					)}
					onSlideChange={onSlideChange}
					position="bottom"
					sliderId={clientId}
				/>
			)}

			{ attributes.navigationType === 'bottom' && showProNavigation && (
				<SliderNavigation
					attributes={attributes}
					currentSlideId={`pro-slide-${currentProSlideIndex}`}
					innerBlocks={mockProBlocks}
					onSlideChange={(slideId) => {
						const index = parseInt(
							slideId.replace('pro-slide-', '')
						);
						handleProSlideChange(index);
					}}
					position="bottom"
					sliderId={clientId}
				/>
			)}
		</>
	);
};
