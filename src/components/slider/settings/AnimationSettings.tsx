import React from 'react';
import { __ } from '@wordpress/i18n';
import { SelectControl, RangeControl } from '@wordpress/components';
import { validateTransitionEffect, validateTransitionEasing, validateNumericRange } from '../../../utils/security';

interface AnimationSettingsProps {
    attributes: any;
    setAttributes: (attrs: Partial<any>) => void;
}

export const AnimationSettings: React.FC<AnimationSettingsProps> = ({ attributes, setAttributes }) => {
    return (
        <>
            <SelectControl
                label={__('Transition Effect', 'sliderberg')}
                value={attributes.transitionEffect}
                options={[
                    { label: __('Slide', 'sliderberg'), value: 'slide' },
                    { label: __('Fade', 'sliderberg'), value: 'fade' },
                    { label: __('Zoom', 'sliderberg'), value: 'zoom' }
                ]}
                onChange={(value) => setAttributes({ transitionEffect: validateTransitionEffect(value) })}
            />
            <RangeControl
                label={__('Transition Duration', 'sliderberg')}
                value={attributes.transitionDuration}
                onChange={(value) => setAttributes({ transitionDuration: validateNumericRange(value ?? 500, 200, 2000, 500) })}
                min={200}
                max={2000}
                step={100}
                help={__('Duration of the transition in milliseconds', 'sliderberg')}
            />
            <SelectControl
                label={__('Transition Easing', 'sliderberg')}
                value={attributes.transitionEasing}
                options={[
                    { label: __('Ease', 'sliderberg'), value: 'ease' },
                    { label: __('Ease In', 'sliderberg'), value: 'ease-in' },
                    { label: __('Ease Out', 'sliderberg'), value: 'ease-out' },
                    { label: __('Ease In Out', 'sliderberg'), value: 'ease-in-out' },
                    { label: __('Linear', 'sliderberg'), value: 'linear' }
                ]}
                onChange={(value) => setAttributes({ transitionEasing: validateTransitionEasing(value) })}
            />
        </>
    );
}; 