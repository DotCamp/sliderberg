import React from 'react';
import { __ } from '@wordpress/i18n';
import { 
    PanelBody,
    SelectControl,
    RangeControl
} from '@wordpress/components';
import { SliderAttributes } from '../../../types/slider';

interface WidthControlProps {
    attributes: SliderAttributes;
    setAttributes: (attrs: Partial<SliderAttributes>) => void;
}

const PRESET_WIDTHS = {
    default: __('Default', 'sliderberg'),
    wide: __('Wide', 'sliderberg'),
    full: __('Full width', 'sliderberg'),
    custom: __('Custom', 'sliderberg')
};

export const WidthControl: React.FC<WidthControlProps> = ({ attributes, setAttributes }) => {
    // Default to 'full' if widthPreset is not set
    const widthPreset = attributes.widthPreset || 'full';
    const { customWidth } = attributes;

    const handlePresetChange = (preset: string) => {
        if (preset === 'custom') {
            setAttributes({ widthPreset: preset, align: undefined, widthUnit: 'px' });
        } else {
            let alignValue: 'wide' | 'full' | undefined = undefined;
            if (preset === 'wide') alignValue = 'wide';
            if (preset === 'full') alignValue = 'full';
            setAttributes({ widthPreset: preset, align: alignValue, customWidth: '', widthUnit: 'px' });
        }
    };

    return (
        <PanelBody
            title={__('Width Settings', 'sliderberg')}
            initialOpen={true}
        >
            <SelectControl
                label={__('Width Preset', 'sliderberg')}
                value={widthPreset}
                options={Object.entries(PRESET_WIDTHS).map(([value, label]) => ({
                    value,
                    label
                }))}
                onChange={handlePresetChange}
            />

            {widthPreset === 'custom' && (
                <RangeControl
                    label={__('Custom Width (px)', 'sliderberg')}
                    value={parseInt(customWidth) || 600}
                    onChange={(value) => setAttributes({ customWidth: String(value), widthUnit: 'px' })}
                    min={200}
                    max={2000}
                />
            )}
        </PanelBody>
    );
}; 