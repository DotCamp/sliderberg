import React, { useEffect } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';

// Import sub-components
import { TypeSelector } from './TypeSelector';
import { SliderContent } from './SliderContent';
import { SliderSettings } from './settings/SliderSettings';
import { useSliderState } from '../../hooks/useSliderState';
import { SliderAttributes } from '../../types/slider';

interface SliderType {
    id: string;
    title: string;
    description: string;
    icon: JSX.Element;
    isComingSoon?: boolean;
    isPro?: boolean;
}

interface EditProps {
    attributes: SliderAttributes;
    setAttributes: (attrs: Partial<SliderAttributes>) => void;
    clientId: string;
}

export const Edit: React.FC<EditProps> = ({ attributes, setAttributes, clientId }) => {
    const { 
        currentSlideId, 
        innerBlocks, 
        handleSlideChange, 
        handleAddSlide, 
        handleDeleteSlide,
        handleDuplicateSlide
    } = useSliderState(clientId, attributes);
    
    // Ensure align is always set for custom width to avoid validation errors
    React.useEffect(() => {
        if (attributes.widthPreset === 'custom' && !attributes.align) {
            setAttributes({ align: 'full' });
        }
    }, [attributes.widthPreset, attributes.align, setAttributes]);

    const blockProps = useBlockProps({
        style: {
            '--sliderberg-dot-color': attributes.dotColor,
            '--sliderberg-dot-active-color': attributes.dotActiveColor,
            '--sliderberg-custom-width': attributes.widthPreset === 'custom' && attributes.customWidth ? 
                `${attributes.customWidth}px` : undefined
        } as React.CSSProperties,
        'data-width-preset': attributes.widthPreset
    });

    // Update visibility when type changes
    useEffect(() => {
        if (attributes.type && typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            window.updateSliderbergSlidesVisibility();
        }
    }, [attributes.type]);

    const handleTypeSelect = (typeId: string) => {
        // The filter has already been applied in TypeSelector
        // Just set the attributes for regular types
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
                    onDuplicateSlide={handleDuplicateSlide}
                    onSlideChange={handleSlideChange}
                    clientId={clientId}
                />
            )}
        </div>
    );
}; 