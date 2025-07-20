import React, { useEffect } from 'react';
import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { PanelBody } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { AnimationSettings } from './AnimationSettings';
import { AutoplaySettings } from './AutoplaySettings';
import { NavigationSettings } from './NavigationSettings';
import { SliderAttributes } from '../../../types/slider';
import { WidthControl } from './WidthControl';
import { CarouselSettings } from '../CarouselSettings';

interface SliderSettingsProps {
	attributes: SliderAttributes;
	setAttributes: ( attrs: Partial< SliderAttributes > ) => void;
}

export const SliderSettings: React.FC< SliderSettingsProps > = ( {
	attributes,
	setAttributes,
} ) => {
	// Ensure navigation type and placement are consistent
	useEffect( () => {
		if (
			attributes.navigationType === 'top' ||
			attributes.navigationType === 'bottom'
		) {
			if ( attributes.navigationPlacement !== 'outside' ) {
				setAttributes( { navigationPlacement: 'outside' } );
			}
		}
	}, [
		attributes.navigationType,
		attributes.navigationPlacement,
		setAttributes,
	] );

	// Get visible settings based on slider type
	const visibleSettings = applyFilters(
		'sliderberg.visibleSettings',
		[ 'width', 'animation', 'autoplay', 'navigation', 'carousel' ],
		attributes.type
	) as string[];

	// Get type-specific settings
	const typeSpecificSettings = applyFilters(
		'sliderberg.typeSettings',
		null,
		attributes.type,
		attributes,
		setAttributes
	) as React.ReactNode;

	// Before core settings slot
	const beforeCoreSettings = applyFilters(
		'sliderberg.beforeCoreSettings',
		null,
		attributes,
		setAttributes
	) as React.ReactNode;

	// After core settings slot
	const afterCoreSettings = applyFilters(
		'sliderberg.afterCoreSettings',
		null,
		attributes,
		setAttributes
	) as React.ReactNode;

	return (
		<InspectorControls>
			{ beforeCoreSettings }

			{ typeSpecificSettings }

			{ visibleSettings.includes( 'width' ) && (
				<WidthControl
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			) }

			{ visibleSettings.includes( 'animation' ) && (
				<PanelBody
					title={ __( 'Animation Settings', 'sliderberg' ) }
					initialOpen={ attributes.type !== 'posts' }
				>
					<AnimationSettings
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</PanelBody>
			) }

			{ visibleSettings.includes( 'autoplay' ) && (
				<PanelBody
					title={ __( 'Autoplay Settings', 'sliderberg' ) }
					initialOpen={ false }
				>
					<AutoplaySettings
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</PanelBody>
			) }

			{ visibleSettings.includes( 'navigation' ) && (
				<PanelBody
					title={ __( 'Navigation Settings', 'sliderberg' ) }
					initialOpen={ false }
				>
					<NavigationSettings
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>
				</PanelBody>
			) }

			{ visibleSettings.includes( 'carousel' ) && (
				<CarouselSettings
					attributes={ attributes }
					setAttributes={ setAttributes }
				/>
			) }

			{ afterCoreSettings }
		</InspectorControls>
	);
};
