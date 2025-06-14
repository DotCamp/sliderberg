import React from 'react';
import { __ } from '@wordpress/i18n';
import { ToggleControl, RangeControl } from '@wordpress/components';
import { validateNumericRange } from '../../../utils/security';
import { SliderAttributes } from '../../../types/slider';

interface AutoplaySettingsProps {
	attributes: SliderAttributes;
	setAttributes: ( attrs: Partial< SliderAttributes > ) => void;
}

export const AutoplaySettings: React.FC< AutoplaySettingsProps > = ( {
	attributes,
	setAttributes,
} ) => {
	return (
		<>
			<ToggleControl
				label={ __( 'Enable Autoplay', 'sliderberg' ) }
				checked={ attributes.autoplay }
				onChange={ ( value ) => setAttributes( { autoplay: value } ) }
			/>
			{ attributes.autoplay && (
				<>
					<RangeControl
						label={ __( 'Autoplay Speed (ms)', 'sliderberg' ) }
						value={ attributes.autoplaySpeed }
						onChange={ ( value ) =>
							setAttributes( {
								autoplaySpeed: validateNumericRange(
									value ?? 5000,
									1000,
									10000,
									5000
								),
							} )
						}
						min={ 1000 }
						max={ 10000 }
						step={ 500 }
					/>
					<ToggleControl
						label={ __( 'Pause on Hover', 'sliderberg' ) }
						checked={ attributes.pauseOnHover }
						onChange={ ( value ) =>
							setAttributes( { pauseOnHover: value } )
						}
					/>
				</>
			) }
		</>
	);
};
