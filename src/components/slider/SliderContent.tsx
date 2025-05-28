// src/components/slider/SliderContent.tsx
import React, { useEffect, useState } from 'react';
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { SliderNavigation } from './navigation/SliderNavigation';
import { SliderControls } from './SliderControls';

// Allow both regular slides and pro slider blocks
const ALLOWED_BLOCKS = [
    'sliderberg/slide',
    'sliderberg-pro/posts-slider',
    'sliderberg-pro/woo-products'
];

interface SliderContentProps {
    attributes: any;
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
    clientId
}) => {
    const [proSlides, setProSlides] = useState<HTMLElement[]>([]);
    const [currentProSlideIndex, setCurrentProSlideIndex] = useState(0);

    // Check if we have pro blocks
    const hasProBlocks = innerBlocks.some(block => 
        block.name === 'sliderberg-pro/posts-slider' || 
        block.name === 'sliderberg-pro/woo-products'
    );

    // Only show slide blocks
    const hasRegularSlides = innerBlocks.some(block => block.name === 'sliderberg/slide');

    // For pro blocks, we need to find the actual slide elements and manage navigation
    useEffect(() => {
        if (hasProBlocks) {
            const timer = setTimeout(() => {
                const proSlideElements = document.querySelectorAll('.sliderberg-post-slide') as NodeListOf<HTMLElement>;
                if (proSlideElements.length > 0) {
                    setProSlides(Array.from(proSlideElements));
                    
                    // Check if any slide is already marked as active, otherwise show first
                    const activeSlide = Array.from(proSlideElements).find(slide => 
                        slide.getAttribute('data-is-active') === 'true'
                    );
                    
                    if (activeSlide) {
                        const activeIndex = Array.from(proSlideElements).indexOf(activeSlide);
                        setCurrentProSlideIndex(activeIndex);
                    } else {
                        // Show only the first slide initially and mark it as active
                        proSlideElements.forEach((slide, index) => {
                            const isFirst = index === 0;
                            slide.style.display = isFirst ? 'block' : 'none';
                            slide.setAttribute('data-is-active', isFirst ? 'true' : 'false');
                        });
                        setCurrentProSlideIndex(0);
                    }
                }
            }, 200); // Give time for posts to load

            return () => clearTimeout(timer);
        }
    }, [hasProBlocks, innerBlocks]);

    // Handle pro slide navigation
    const handleProSlideChange = (index: number) => {
        if (proSlides.length === 0) return;
        
        setCurrentProSlideIndex(index);
        proSlides.forEach((slide, slideIndex) => {
            slide.style.display = slideIndex === index ? 'block' : 'none';
            // Add a data attribute to track the current state
            slide.setAttribute('data-is-active', slideIndex === index ? 'true' : 'false');
        });
    };

    // Create mock inner blocks for pro slides to work with navigation
    const mockProBlocks = proSlides.map((_, index) => ({
        clientId: `pro-slide-${index}`,
        name: 'sliderberg-pro/post-slide'
    }));

    // Determine what navigation to show
    const showRegularNavigation = !hasProBlocks && hasRegularSlides;
    const showProNavigation = hasProBlocks && proSlides.length > 1;

    // For pro blocks, we don't show the slide controls since they have their own content
    const showSlideControls = !hasProBlocks && (hasRegularSlides || attributes.type === 'blocks');

    // Determine the template based on the type
    let template: any[] | undefined = undefined;
    let templateLock: string | false = false;

    if (attributes.type === 'blocks' && innerBlocks.length === 0) {
        // Only add default slide template for blocks type when there are no blocks
        template = [['sliderberg/slide', {}]];
    } else if (hasProBlocks) {
        // For pro blocks, don't set any template
        template = undefined;
    }

    return (
        <>
            {showSlideControls && (
                <SliderControls
                    onAddSlide={onAddSlide}
                    onDeleteSlide={onDeleteSlide}
                    onDuplicateSlide={() => {
                        if (currentSlideId) {
                            onDuplicateSlide(currentSlideId);
                        }
                    }}
                    canDelete={innerBlocks.length > 1}
                    currentSlideId={currentSlideId}
                />
            )}
            
            {attributes.navigationType === 'top' && showRegularNavigation && (
                <SliderNavigation
                    attributes={attributes}
                    currentSlideId={currentSlideId}
                    innerBlocks={innerBlocks.filter(block => block.name === 'sliderberg/slide')}
                    onSlideChange={onSlideChange}
                    position="top"
                />
            )}

            {attributes.navigationType === 'top' && showProNavigation && (
                <SliderNavigation
                    attributes={attributes}
                    currentSlideId={`pro-slide-${currentProSlideIndex}`}
                    innerBlocks={mockProBlocks}
                    onSlideChange={(slideId) => {
                        const index = parseInt(slideId.replace('pro-slide-', ''));
                        handleProSlideChange(index);
                    }}
                    position="top"
                />
            )}
            
            <div className="sliderberg-content">
                <div className="sliderberg-slides" style={{ position: 'relative' }}>
                    <div className="sliderberg-slides-container" style={{ width: '100%' }} data-current-slide-id={currentSlideId || ''}>
                        <InnerBlocks
                            allowedBlocks={ALLOWED_BLOCKS}
                            template={template}
                            templateLock={templateLock}
                            orientation="horizontal"
                        />
                    </div>
                </div>
                
                {attributes.navigationType === 'split' && showRegularNavigation && (
                    <SliderNavigation
                        attributes={attributes}
                        currentSlideId={currentSlideId}
                        innerBlocks={innerBlocks.filter(block => block.name === 'sliderberg/slide')}
                        onSlideChange={onSlideChange}
                        position="split"
                    />
                )}

                {attributes.navigationType === 'split' && showProNavigation && (
                    <SliderNavigation
                        attributes={attributes}
                        currentSlideId={`pro-slide-${currentProSlideIndex}`}
                        innerBlocks={mockProBlocks}
                        onSlideChange={(slideId) => {
                            const index = parseInt(slideId.replace('pro-slide-', ''));
                            handleProSlideChange(index);
                        }}
                        position="split"
                    />
                )}
            </div>
            
            {attributes.navigationType === 'bottom' && showRegularNavigation && (
                <SliderNavigation
                    attributes={attributes}
                    currentSlideId={currentSlideId}
                    innerBlocks={innerBlocks.filter(block => block.name === 'sliderberg/slide')}
                    onSlideChange={onSlideChange}
                    position="bottom"
                />
            )}

            {attributes.navigationType === 'bottom' && showProNavigation && (
                <SliderNavigation
                    attributes={attributes}
                    currentSlideId={`pro-slide-${currentProSlideIndex}`}
                    innerBlocks={mockProBlocks}
                    onSlideChange={(slideId) => {
                        const index = parseInt(slideId.replace('pro-slide-', ''));
                        handleProSlideChange(index);
                    }}
                    position="bottom"
                />
            )}
        </>
    );
};