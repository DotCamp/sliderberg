import React from 'react';
import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';

interface SliderControlsProps {
    onAddSlide: () => void;
    onDeleteSlide: () => void;
    canDelete: boolean;
}

export const SliderControls: React.FC<SliderControlsProps> = ({ onAddSlide, onDeleteSlide, canDelete }) => {
    return (
        <div className="sliderberg-action-buttons">
            <Button
                variant="primary"
                className="sliderberg-add-slide"
                onClick={onAddSlide}
            >
                {__('Add Slide', 'sliderberg')}
            </Button>
            <Button
                variant="secondary"
                className="sliderberg-delete-slide"
                onClick={onDeleteSlide}
                disabled={!canDelete}
                isDestructive
            >
                {__('Delete Slide', 'sliderberg')}
            </Button>
        </div>
    );
}; 