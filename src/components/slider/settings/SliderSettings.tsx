import React, { useEffect } from 'react';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { AnimationSettings } from './AnimationSettings';
import { AutoplaySettings } from './AutoplaySettings';
import { NavigationSettings } from './NavigationSettings';
import { SliderAttributes } from '../../../types/slider';
import { WidthControl } from './WidthControl';

interface SliderSettingsProps {
    attributes: SliderAttributes;
    setAttributes: (attrs: Partial<SliderAttributes>) => void;
}

export const SliderSettings: React.FC<SliderSettingsProps> = ({ attributes, setAttributes }) => {
    // Ensure navigation type and placement are consistent
    useEffect(() => {
        if (attributes.navigationType === 'top' || attributes.navigationType === 'bottom') {
            if (attributes.navigationPlacement !== 'outside') {
                setAttributes({ navigationPlacement: 'outside' });
            }
        }
    }, [attributes.navigationType, attributes.navigationPlacement, setAttributes]);

    return (
        <InspectorControls>
            <WidthControl 
                attributes={attributes}
                setAttributes={setAttributes}
            />
            <PanelBody title={__('Animation Settings', 'sliderberg')} initialOpen={true}>
                <AnimationSettings 
                    attributes={attributes} 
                    setAttributes={setAttributes} 
                />
            </PanelBody>
            
            <PanelBody title={__('Autoplay Settings', 'sliderberg')} initialOpen={false}>
                <AutoplaySettings 
                    attributes={attributes} 
                    setAttributes={setAttributes} 
                />
            </PanelBody>
            
            <PanelBody title={__('Navigation Settings', 'sliderberg')} initialOpen={false}>
                <NavigationSettings 
                    attributes={attributes} 
                    setAttributes={setAttributes} 
                />
            </PanelBody>
        </InspectorControls>
    );
}; 