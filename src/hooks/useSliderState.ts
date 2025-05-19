import { useState, useEffect } from 'react';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

export const useSliderState = (clientId: string, attributes: any) => {
    const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Get the current inner blocks for this slider
    const innerBlocks = useSelect(
        (select: any) => clientId ? select('core/block-editor').getBlocks(clientId) : [],
        [clientId]
    );

    const { insertBlock, selectBlock, removeBlock } = useDispatch('core/block-editor');

    // Set the first slide as current by default if not set or if current slide no longer exists
    useEffect(() => {
        if (innerBlocks.length > 0) {
            const currentSlideExists = currentSlideId && innerBlocks.some((b: any) => b.clientId === currentSlideId);
            if (!currentSlideExists) {
                setCurrentSlideId(innerBlocks[0].clientId);
            }
        }
    }, [innerBlocks]); // Only depend on innerBlocks changes

    // Handle visibility updates after state changes
    useEffect(() => {
        if (isUpdating && typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            window.updateSliderbergSlidesVisibility();
            setIsUpdating(false);
        }
    }, [isUpdating]);

    const handleAddSlide = () => {
        const slideBlock = createBlock('sliderberg/slide');
        insertBlock(slideBlock, innerBlocks.length, clientId);
        setIsUpdating(true);
        
        // Use useSelect to get the latest blocks after insertion
        const updatedBlocks = select('core/block-editor').getBlocks(clientId);
        const newBlock = updatedBlocks[updatedBlocks.length - 1];
        if (newBlock) {
            setCurrentSlideId(newBlock.clientId);
            selectBlock(newBlock.clientId);
        }
    };

    const handleSlideChange = (newSlideId: string) => {
        setCurrentSlideId(newSlideId);
        selectBlock(newSlideId);
        setIsUpdating(true);
    };

    const handleDeleteSlide = () => {
        if (innerBlocks.length <= 1 || !currentSlideId) return;
        
        const currentIndex = innerBlocks.findIndex((b: any) => b.clientId === currentSlideId);
        removeBlock(currentSlideId);
        setIsUpdating(true);

        // After deletion, select the previous or next slide
        const updatedBlocks = select('core/block-editor').getBlocks(clientId);
        if (updatedBlocks.length > 0) {
            const newIndex = Math.min(currentIndex, updatedBlocks.length - 1);
            setCurrentSlideId(updatedBlocks[newIndex].clientId);
            selectBlock(updatedBlocks[newIndex].clientId);
        }
    };

    return {
        currentSlideId,
        innerBlocks,
        handleSlideChange,
        handleAddSlide,
        handleDeleteSlide
    };
}; 