import React from 'react';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export const Save: React.FC = () => {
    const blockProps = useBlockProps.save();

    return (
        <div {...blockProps}>
            <div className="sliderberg-container">
                <div className="sliderberg-slides">
                    <div className="sliderberg-slides-container">
                        <InnerBlocks.Content />
                    </div>
                    <div className="sliderberg-navigation">
                        <button className="sliderberg-nav-button sliderberg-prev" aria-label="Previous Slide">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z"/>
                            </svg>
                        </button>
                        <div className="sliderberg-slide-indicators">
                            {/* Slide indicators will be added dynamically via JavaScript */}
                        </div>
                        <button className="sliderberg-nav-button sliderberg-next" aria-label="Next Slide">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 