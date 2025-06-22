import React from 'react';
import { __ } from '@wordpress/i18n';
import { SelectControl, RangeControl } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import {
	validateTransitionEffect,
	validateTransitionEasing,
	validateNumericRange,
} from '../../../utils/security';
import { SliderAttributes } from '../../../types/slider';

interface AnimationSettingsProps {
	attributes: SliderAttributes;
	setAttributes: ( attrs: Partial< SliderAttributes > ) => void;
}

interface TransitionEffectOption {
	label: string;
	value: string;
	isPro?: boolean;
}

export const AnimationSettings: React.FC< AnimationSettingsProps > = ( {
	attributes,
	setAttributes,
} ) => {
	// Default transition effects
	const defaultEffects: TransitionEffectOption[] = [
		{
			label: __( 'Slide', 'sliderberg' ),
			value: 'slide',
		},
		{
			label: __( 'Fade', 'sliderberg' ),
			value: 'fade',
		},
		{
			label: __( 'Zoom', 'sliderberg' ),
			value: 'zoom',
		},
	];

	// Allow pro plugin to add more transition effects
	const allEffects = applyFilters(
		'sliderberg.transitionEffects',
		defaultEffects,
		attributes.isCarouselMode
	) as TransitionEffectOption[];

	// Filter effects based on carousel mode
	const availableEffects = attributes.isCarouselMode
		? allEffects.filter( effect => effect.value === 'slide' )
		: allEffects;

	return (
		<>
			<SelectControl
				label={ __( 'Transition Effect', 'sliderberg' ) }
				value={ attributes.transitionEffect }
				options={ availableEffects }
				onChange={ ( value ) =>
					setAttributes( {
						transitionEffect: validateTransitionEffect( value ),
					} )
				}
			/>
			<RangeControl
				label={ __( 'Transition Duration', 'sliderberg' ) }
				value={ attributes.transitionDuration }
				onChange={ ( value ) =>
					setAttributes( {
						transitionDuration: validateNumericRange(
							value ?? 500,
							200,
							2000,
							500
						),
					} )
				}
				min={ 200 }
				max={ 2000 }
				step={ 100 }
				help={ __(
					'Duration of the transition in milliseconds',
					'sliderberg'
				) }
			/>
			<SelectControl
				label={ __( 'Transition Easing', 'sliderberg' ) }
				value={ attributes.transitionEasing }
				options={ [
					{ label: __( 'Ease', 'sliderberg' ), value: 'ease' },
					{ label: __( 'Ease In', 'sliderberg' ), value: 'ease-in' },
					{
						label: __( 'Ease Out', 'sliderberg' ),
						value: 'ease-out',
					},
					{
						label: __( 'Ease In Out', 'sliderberg' ),
						value: 'ease-in-out',
					},
					{ label: __( 'Linear', 'sliderberg' ), value: 'linear' },
				] }
				onChange={ ( value ) =>
					setAttributes( {
						transitionEasing: validateTransitionEasing( value ),
					} )
				}
			/>
		</>
	);
};
