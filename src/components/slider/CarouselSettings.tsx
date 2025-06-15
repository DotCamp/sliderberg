import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { ToggleControl, RangeControl, PanelBody } from '@wordpress/components';

interface CarouselSettingsProps {
    attributes: {
        isCarouselMode: boolean;
        slidesToShow: number;
        slidesToScroll: number;
        slideSpacing: number;
        partialVisibility: boolean;
        infiniteLoop: boolean;
    };
    setAttributes: (attrs: Partial<CarouselSettingsProps['attributes']>) => void;
}

export const CarouselSettings: React.FC<CarouselSettingsProps> = ({
    attributes,
    setAttributes,
}) => {
    const {
        isCarouselMode,
        slidesToShow,
        slidesToScroll,
        slideSpacing,
        partialVisibility,
        infiniteLoop,
    } = attributes;

    return (
        <PanelBody
            title={__('Carousel Settings', 'sliderberg')}
            initialOpen={false}
        >
            <ToggleControl
                label={__('Enable Carousel Mode', 'sliderberg')}
                checked={isCarouselMode}
                onChange={(value) => setAttributes({ isCarouselMode: value })}
            />

            {isCarouselMode && (
                <>
                    <RangeControl
                        label={__('Slides to Show', 'sliderberg')}
                        value={slidesToShow}
                        onChange={(value) => setAttributes({ slidesToShow: value })}
                        min={1}
                        max={6}
                    />

                    <RangeControl
                        label={__('Slides to Scroll', 'sliderberg')}
                        value={slidesToScroll}
                        onChange={(value) => setAttributes({ slidesToScroll: value })}
                        min={1}
                        max={slidesToShow}
                    />

                    <RangeControl
                        label={__('Slide Spacing', 'sliderberg')}
                        value={slideSpacing}
                        onChange={(value) => setAttributes({ slideSpacing: value })}
                        min={0}
                        max={100}
                        step={5}
                    />

                    <ToggleControl
                        label={__('Show Partial Slides', 'sliderberg')}
                        checked={partialVisibility}
                        onChange={(value) => setAttributes({ partialVisibility: value })}
                        help={__(
                            'Show parts of adjacent slides on the sides',
                            'sliderberg'
                        )}
                    />

                    <ToggleControl
                        label={__('Infinite Loop', 'sliderberg')}
                        checked={infiniteLoop}
                        onChange={(value) => setAttributes({ infiniteLoop: value })}
                        help={__(
                            'Enable continuous looping of slides',
                            'sliderberg'
                        )}
                    />
                </>
            )}
        </PanelBody>
    );
}; 