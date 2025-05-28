import React from 'react';
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
    // Check if we have pro blocks
    const hasProBlocks = innerBlocks.some(block => 
        block.name === 'sliderberg-pro/posts-slider' || 
        block.name === 'sliderberg-pro/woo-products'
    );

    // Only show slide blocks
    const hasRegularSlides = innerBlocks.some(block => block.name === 'sliderberg/slide');

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
            
            {attributes.navigationType === 'top' && !hasProBlocks && hasRegularSlides && (
                <SliderNavigation
                    attributes={attributes}
                    currentSlideId={currentSlideId}
                    innerBlocks={innerBlocks.filter(block => block.name === 'sliderberg/slide')}
                    onSlideChange={onSlideChange}
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
                
                {attributes.navigationType === 'split' && !hasProBlocks && hasRegularSlides && (
                    <SliderNavigation
                        attributes={attributes}
                        currentSlideId={currentSlideId}
                        innerBlocks={innerBlocks.filter(block => block.name === 'sliderberg/slide')}
                        onSlideChange={onSlideChange}
                        position="split"
                    />
                )}
            </div>
            
            {attributes.navigationType === 'bottom' && !hasProBlocks && hasRegularSlides && (
                <SliderNavigation
                    attributes={attributes}
                    currentSlideId={currentSlideId}
                    innerBlocks={innerBlocks.filter(block => block.name === 'sliderberg/slide')}
                    onSlideChange={onSlideChange}
                    position="bottom"
                />
            )}
        </>
    );
};