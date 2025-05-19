import React from 'react';
import { __ } from '@wordpress/i18n';
import { ToggleControl, RangeControl } from '@wordpress/components';

interface AutoplaySettingsProps {
    attributes: any;
    setAttributes: (attrs: Partial<any>) => void;
}

export const AutoplaySettings: React.FC<AutoplaySettingsProps> = ({ attributes, setAttributes }) => {
    return (
        <>
            <ToggleControl
                label={__('Enable Autoplay', 'sliderberg')}
                checked={attributes.autoplay}
                onChange={(value) => setAttributes({ autoplay: value })}
            />
            {attributes.autoplay && (
                <>
                    <RangeControl
                        label={__('Autoplay Speed (ms)', 'sliderberg')}
                        value={attributes.autoplaySpeed}
                        onChange={(value) => setAttributes({ autoplaySpeed: value })}
                        min={1000}
                        max={10000}
                        step={500}
                    />
                    <ToggleControl
                        label={__('Pause on Hover', 'sliderberg')}
                        checked={attributes.pauseOnHover}
                        onChange={(value) => setAttributes({ pauseOnHover: value })}
                    />
                </>
            )}
        </>
    );
}; 