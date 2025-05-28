import React, { useEffect } from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import type { BlockInstance } from '@wordpress/blocks';

// Import sub-components
import { TypeSelector } from './TypeSelector';
import { SliderContent } from './SliderContent';
import { SliderSettings } from './settings/SliderSettings';
import { useSliderState } from '../../hooks/useSliderState';
import { SliderAttributes } from '../../types/slider';

// Declare wp namespace
declare const wp: {
    data: {
        dispatch: (store: string) => {
            removeBlocks: (clientIds: string[]) => void;
            insertBlocks: (blocks: BlockInstance[], index: number, rootClientId: string) => void;
        };
    };
};

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

    // Handle pro block insertion when type is set to a pro type
    useEffect(() => {
        const isProType = ['posts-slider', 'woo-products'].includes(attributes.type);
        const hasProChild = innerBlocks.some((block: BlockInstance) => 
            block.name === 'sliderberg-pro/posts-slider' || 
            block.name === 'sliderberg-pro/woo-products'
        );

        if (isProType && !hasProChild) {
            console.log('Pro type detected, inserting pro block:', attributes.type);
            
            // Remove any existing child blocks first
            if (innerBlocks.length > 0) {
                const { removeBlocks } = wp.data.dispatch('core/block-editor');
                const childClientIds = innerBlocks.map((block: BlockInstance) => block.clientId);
                removeBlocks(childClientIds);
            }

            // Insert the appropriate pro block
            setTimeout(() => {
                const { insertBlocks } = wp.data.dispatch('core/block-editor');
                
                if (attributes.type === 'posts-slider') {
                    const postsSliderBlock = createBlock('sliderberg-pro/posts-slider', {
                        postType: 'posts',
                        numberOfPosts: 5,
                        order: 'desc',
                        showFeaturedImage: true,
                        showTitle: true,
                        showExcerpt: true
                    });
                    insertBlocks([postsSliderBlock], 0, clientId);
                } else if (attributes.type === 'woo-products') {
                    const wooSliderBlock = createBlock('sliderberg-pro/woo-products', {
                        productCategory: '',
                        numberOfProducts: 5,
                        productOrder: 'desc',
                        showPrice: true,
                        showAddToCart: true
                    });
                    insertBlocks([wooSliderBlock], 0, clientId);
                }
            }, 10); // Small delay to ensure state is updated
        }
    }, [attributes.type, innerBlocks, clientId]);

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
        // Set the type for any slider type (including pro types)
        setAttributes({ type: typeId });
        
        // Force visibility update after type selection
        setTimeout(() => {
            if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
                window.updateSliderbergSlidesVisibility();
            }
        }, 10);
    };

    // Check if we have pro blocks as children
    const hasProChild = innerBlocks.some((block: BlockInstance) => 
        block.name === 'sliderberg-pro/posts-slider' || 
        block.name === 'sliderberg-pro/woo-products'
    );

    // Check if it's a pro slider type or has pro children
    const isProSliderType = ['posts-slider', 'woo-products'].includes(attributes.type) || hasProChild;

    return (
        <div {...blockProps}>
            <SliderSettings 
                attributes={attributes} 
                setAttributes={setAttributes} 
            />
            
            {!attributes.type && !hasProChild ? (
                <TypeSelector 
                    onTypeSelect={handleTypeSelect} 
                />
            ) : isProSliderType ? (
                // Render pro slider content with settings intact
                <>
                    {/* Render the pro slider content - it will be the child blocks */}
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
                </>
            ) : (
                // Render regular blocks slider
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