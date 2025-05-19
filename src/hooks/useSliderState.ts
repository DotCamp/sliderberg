import { useState, useEffect } from 'react';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

export const useSliderState = (clientId: string, attributes: any) => {
    const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);

    // Get the current inner blocks for this slider
    const innerBlocks = useSelect(
        (select: any) => clientId ? select('core/block-editor').getBlocks(clientId) : [],
        [clientId]
    );

    const { insertBlock, selectBlock, removeBlock } = useDispatch('core/block-editor');

    // Set the first slide as current by default if not set
    useEffect(() => {
        if (innerBlocks.length > 0 && (!currentSlideId || !innerBlocks.find((b: any) => b.clientId === currentSlideId))) {
            setCurrentSlideId(innerBlocks[0].clientId);
        }
        // Ensure correct slide is shown on initial render
        if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
        }
    }, [innerBlocks, currentSlideId]);

    const handleAddSlide = () => {
        const slideBlock = createBlock('sliderberg/slide');
        insertBlock(slideBlock, innerBlocks.length, clientId);
        setTimeout(() => {
            const updatedBlocks = select('core/block-editor').getBlocks(clientId);
            const newBlock = updatedBlocks[updatedBlocks.length - 1];
            if (newBlock) {
                setCurrentSlideId(newBlock.clientId);
                selectBlock(newBlock.clientId);
                if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
                    setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
                }
            }
        }, 50);
    };

    const handleSlideChange = (newSlideId: string) => {
        setCurrentSlideId(newSlideId);
        selectBlock(newSlideId);
        if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
        }
    };

    const handleDeleteSlide = () => {
        if (innerBlocks.length <= 1 || !currentSlideId) return;
        removeBlock(currentSlideId);
        // After deletion, select the previous or next slide
        setTimeout(() => {
            const updatedBlocks = select('core/block-editor').getBlocks(clientId);
            if (updatedBlocks.length > 0) {
                const idx = Math.max(0, updatedBlocks.length - 1);
                setCurrentSlideId(updatedBlocks[idx].clientId);
                selectBlock(updatedBlocks[idx].clientId);
                if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
                    setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
                }
            }
        }, 50);
    };

    return {
        currentSlideId,
        innerBlocks,
        handleSlideChange,
        handleAddSlide,
        handleDeleteSlide
    };
}; 