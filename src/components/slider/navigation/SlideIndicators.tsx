import React from 'react';
import { __ } from '@wordpress/i18n';

interface SlideIndicatorsProps {
    innerBlocks: any[];
    currentSlideId: string | null;
    onSlideChange: (slideId: string) => void;
    dotColor: string;
    dotActiveColor: string;
}

export const SlideIndicators: React.FC<SlideIndicatorsProps> = ({
    innerBlocks,
    currentSlideId,
    onSlideChange,
    dotColor,
    dotActiveColor
}) => {
    return (
        <div className="sliderberg-slide-indicators">
            {innerBlocks.map((block: any) => (
                <button
                    key={block.clientId}
                    className={`sliderberg-slide-indicator ${block.clientId === currentSlideId ? 'active' : ''}`}
                    onClick={() => onSlideChange(block.clientId)}
                    aria-label={__('Go to slide', 'sliderberg') + ' ' + (innerBlocks.findIndex((b: any) => b.clientId === block.clientId) + 1)}
                    style={{
                        backgroundColor: block.clientId === currentSlideId ? dotActiveColor : dotColor
                    }}
                />
            ))}
        </div>
    );
}; 