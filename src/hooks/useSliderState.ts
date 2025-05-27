import { useState, useEffect } from 'react';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { createBlock, cloneBlock } from '@wordpress/blocks';
import { store as blockEditorStore } from '@wordpress/block-editor';

type BlockEditorSelect = {
    getBlocks: (clientId: string) => any[];
    getBlock: (clientId: string) => any;
    getBlockIndex: (clientId: string, rootClientId: string) => number;
};

export const useSliderState = (clientId: string, attributes: any) => {
    const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // Get the current inner blocks for this slider
    const innerBlocks = useSelect(
        (select: any) => clientId ? select(blockEditorStore).getBlocks(clientId) : [],
        [clientId]
    );

    const { insertBlock, selectBlock, removeBlock, insertBlocks } = useDispatch(blockEditorStore);

    const { getBlock, getBlockIndex } = useSelect(
        (select) => {
            const editorSelect = select(blockEditorStore) as BlockEditorSelect;
            return {
                getBlock: editorSelect.getBlock,
                getBlockIndex: editorSelect.getBlockIndex,
            };
        },
        []
    );

    // Set the first slide as current by default if not set or if current slide no longer exists
    useEffect(() => {
        if (innerBlocks.length > 0) {
            const currentSlideExists = currentSlideId && innerBlocks.some((b: any) => b.clientId === currentSlideId);
            if (!currentSlideExists) {
                setCurrentSlideId(innerBlocks[0].clientId);
                // Immediately update visibility when setting initial slide
                if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
                    window.updateSliderbergSlidesVisibility();
                }
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

    const handleSlideChange = (slideId: string) => {
        setCurrentSlideId(slideId);
        setIsUpdating(true);
        // Immediately update visibility when changing slides
        if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            window.updateSliderbergSlidesVisibility();
        }
    };

    const handleAddSlide = () => {
        const slideBlock = createBlock('sliderberg/slide');
        insertBlock(slideBlock, innerBlocks.length, clientId);
        setIsUpdating(true);
        
        // Use useSelect to get the latest blocks after insertion
        const updatedBlocks = (select(blockEditorStore) as BlockEditorSelect).getBlocks(clientId);
        const newBlock = updatedBlocks[updatedBlocks.length - 1];
        if (newBlock) {
            setCurrentSlideId(newBlock.clientId);
            selectBlock(newBlock.clientId);
            // Immediately update visibility when adding new slide
            if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
                window.updateSliderbergSlidesVisibility();
            }
        }
    };

    const handleDeleteSlide = () => {
        if (innerBlocks.length <= 1) return;
        
        const currentIndex = innerBlocks.findIndex((block: any) => block.clientId === currentSlideId);
        const nextIndex = (currentIndex + 1) % innerBlocks.length;
        const nextSlideId = innerBlocks[nextIndex].clientId;
        
        removeBlock(currentSlideId);
        setCurrentSlideId(nextSlideId);
        setIsUpdating(true);
        // Immediately update visibility when deleting slide
        if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            window.updateSliderbergSlidesVisibility();
        }
    };

    const handleDuplicateSlide = (slideIdToDuplicate: string) => {
        if (!slideIdToDuplicate) {
            console.warn('No slide ID provided to duplicate.');
            return;
        }

        const originalBlock = getBlock(slideIdToDuplicate);
        if (!originalBlock) {
            console.error(`Could not find slide with ID: ${slideIdToDuplicate} to duplicate.`);
            return;
        }

        const duplicatedBlock = cloneBlock(originalBlock);
        if (!duplicatedBlock) {
            console.error('Failed to clone the slide block.');
            return;
        }
        
        const originalSlideIndex = getBlockIndex(slideIdToDuplicate, clientId);
        const insertionPoint = (originalSlideIndex !== -1) ? originalSlideIndex + 1 : innerBlocks.length;

        insertBlocks(duplicatedBlock, insertionPoint, clientId);
        setCurrentSlideId(duplicatedBlock.clientId);
        selectBlock(duplicatedBlock.clientId);
        setIsUpdating(true);
        
        // Ensure the visibility update happens after the state has likely propagated
        setTimeout(() => {
            if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
                window.updateSliderbergSlidesVisibility();
            }
        }, 0);
    };

    return {
        currentSlideId,
        innerBlocks,
        handleSlideChange,
        handleAddSlide,
        handleDeleteSlide,
        handleDuplicateSlide
    };
}; 