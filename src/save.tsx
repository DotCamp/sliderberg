import React from 'react';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

export const Save: React.FC = () => {
    const blockProps = useBlockProps.save();

    return (
        <div {...blockProps}>
            <div className="sliderberg-container">
                <div className="sliderberg-slides">
                    <InnerBlocks.Content />
                </div>
            </div>
        </div>
    );
}; 