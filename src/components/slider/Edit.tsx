import React, { useEffect } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';

// Import sub-components
import { TypeSelector } from './TypeSelector';
import { SliderContent } from './SliderContent';
import { SliderSettings } from './settings/SliderSettings';
import { useSliderState } from '../../hooks/useSliderState';
import { SliderAttributes } from '../../types/slider';

interface EditProps {
    attributes: SliderAttributes;
    setAttributes: (attrs: Partial<SliderAttributes>) => void;
    clientId: string;
}

export const Edit: React.FC<EditProps> = ({ attributes, setAttributes, clientId }) => {
    const { currentSlideId, innerBlocks, handleSlideChange, handleAddSlide, handleDeleteSlide } = 
        useSliderState(clientId, attributes);
    
    const blockProps = useBlockProps({
        style: {
            '--sliderberg-dot-color': attributes.dotColor,
            '--sliderberg-dot-active-color': attributes.dotActiveColor
        } as React.CSSProperties
    });

    // Update visibility when type changes
    useEffect(() => {
        if (attributes.type && typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            window.updateSliderbergSlidesVisibility();
        }
    }, [attributes.type]);

    const handleTypeSelect = (typeId: string) => {
        setAttributes({ type: typeId });
        // Force visibility update after type selection
        setTimeout(() => {
            if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
                window.updateSliderbergSlidesVisibility();
            }
        }, 10);
    };

    return (
        <div {...blockProps}>
            <SliderSettings 
                attributes={attributes} 
                setAttributes={setAttributes} 
            />
            
            {!attributes.type ? (
                <TypeSelector 
                    onTypeSelect={handleTypeSelect} 
                />
            ) : (
                <SliderContent
                    attributes={attributes}
                    currentSlideId={currentSlideId}
                    innerBlocks={innerBlocks}
                    onAddSlide={handleAddSlide}
                    onDeleteSlide={handleDeleteSlide}
                    onSlideChange={handleSlideChange}
                    clientId={clientId}
                />
            )}
        </div>
    );
}; 