import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { ToggleControl, RangeControl, PanelBody } from '@wordpress/components';
import { ResponsiveCarouselSettings } from './ResponsiveCarouselSettings';

interface CarouselSettingsProps {
	attributes: {
		isCarouselMode: boolean;
		slidesToShow: number;
		slidesToScroll: number;
		slideSpacing: number;
		infiniteLoop: boolean;
		tabletSlidesToShow?: number;
		tabletSlidesToScroll?: number;
		tabletSlideSpacing?: number;
		mobileSlidesToShow?: number;
		mobileSlidesToScroll?: number;
		mobileSlideSpacing?: number;
	};
	setAttributes: (
		attrs: Partial< CarouselSettingsProps[ 'attributes' ] >
	) => void;
}

export const CarouselSettings: React.FC< CarouselSettingsProps > = ( {
	attributes,
	setAttributes,
} ) => {
	const {
		isCarouselMode,
		slidesToShow,
		slidesToScroll,
		slideSpacing,
		infiniteLoop,
	} = attributes;

	return (
		<PanelBody
			title={ __( 'Carousel Settings', 'sliderberg' ) }
			initialOpen={ false }
		>
			<ToggleControl
				label={ __( 'Enable Carousel Mode', 'sliderberg' ) }
				checked={ isCarouselMode }
				onChange={ ( value ) =>
					setAttributes( { isCarouselMode: value } )
				}
			/>

			{ isCarouselMode && (
				<>
					<ResponsiveCarouselSettings
						attributes={ attributes }
						setAttributes={ setAttributes }
					/>

					<ToggleControl
						label={ __( 'Infinite Loop', 'sliderberg' ) }
						checked={ infiniteLoop }
						onChange={ ( value ) =>
							setAttributes( { infiniteLoop: value } )
						}
						help={ __(
							'Enable continuous looping of slides',
							'sliderberg'
						) }
					/>
				</>
			) }
		</PanelBody>
	);
};
