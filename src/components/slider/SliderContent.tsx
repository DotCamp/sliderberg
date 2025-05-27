import React from 'react';
import { InnerBlocks } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { SliderNavigation } from './navigation/SliderNavigation';
import { SliderControls } from './SliderControls';

const ALLOWED_BLOCKS = ['sliderberg/slide'];

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
    return (
        <>
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
            
            {attributes.navigationType === 'top' && (
                <SliderNavigation
                    attributes={attributes}
                    currentSlideId={currentSlideId}
                    innerBlocks={innerBlocks}
                    onSlideChange={onSlideChange}
                    position="top"
                />
            )}
            
            <div className="sliderberg-content">
                <div className="sliderberg-slides" style={{ position: 'relative' }}>
                    <div className="sliderberg-slides-container" style={{ width: '100%' }} data-current-slide-id={currentSlideId || ''}>
                        <InnerBlocks
                            allowedBlocks={ALLOWED_BLOCKS}
                            template={[['sliderberg/slide', {}]]}
                            templateLock={false}
                            orientation="horizontal"
                        />
                    </div>
                </div>
                
                {attributes.navigationType === 'split' && (
                    <SliderNavigation
                        attributes={attributes}
                        currentSlideId={currentSlideId}
                        innerBlocks={innerBlocks}
                        onSlideChange={onSlideChange}
                        position="split"
                    />
                )}
            </div>
            
            {attributes.navigationType === 'bottom' && (
                <SliderNavigation
                    attributes={attributes}
                    currentSlideId={currentSlideId}
                    innerBlocks={innerBlocks}
                    onSlideChange={onSlideChange}
                    position="bottom"
                />
            )}
        </>
    );
}; 