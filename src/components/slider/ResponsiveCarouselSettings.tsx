import * as React from 'react';
import { __ } from '@wordpress/i18n';
import { RangeControl, Panel, PanelBody, PanelRow, TabPanel, __experimentalText as Text } from '@wordpress/components';
import { desktop, tablet, mobile } from '@wordpress/icons';
import './responsive-carousel-settings.css';

interface ResponsiveCarouselSettingsProps {
	attributes: {
		slidesToShow: number;
		slidesToScroll: number;
		slideSpacing: number;
		tabletSlidesToShow?: number;
		tabletSlidesToScroll?: number;
		tabletSlideSpacing?: number;
		mobileSlidesToShow?: number;
		mobileSlidesToScroll?: number;
		mobileSlideSpacing?: number;
	};
	setAttributes: (
		attrs: Partial< ResponsiveCarouselSettingsProps[ 'attributes' ] >
	) => void;
}

export const ResponsiveCarouselSettings: React.FC< ResponsiveCarouselSettingsProps > = ( {
	attributes,
	setAttributes,
} ) => {
	const {
		slidesToShow,
		slidesToScroll,
		slideSpacing,
		tabletSlidesToShow = 2,
		tabletSlidesToScroll = 1,
		tabletSlideSpacing = 15,
		mobileSlidesToShow = 1,
		mobileSlidesToScroll = 1,
		mobileSlideSpacing = 10,
	} = attributes;

	const tabs = [
		{
			name: 'desktop',
			title: (
				<>
					<span className="dashicon dashicons dashicons-desktop" style={{ marginRight: '4px' }} />
					{ __( 'Desktop', 'sliderberg' ) }
				</>
			),
			className: 'sliderberg-responsive-tab',
		},
		{
			name: 'tablet',
			title: (
				<>
					<span className="dashicon dashicons dashicons-tablet" style={{ marginRight: '4px' }} />
					{ __( 'Tablet', 'sliderberg' ) }
				</>
			),
			className: 'sliderberg-responsive-tab',
		},
		{
			name: 'mobile',
			title: (
				<>
					<span className="dashicon dashicons dashicons-smartphone" style={{ marginRight: '4px' }} />
					{ __( 'Mobile', 'sliderberg' ) }
				</>
			),
			className: 'sliderberg-responsive-tab',
		},
	];

	return (
		<div className="sliderberg-responsive-settings">
			<TabPanel
				className="sliderberg-responsive-tabs"
				activeClass="is-active"
				tabs={ tabs }
			>
				{ ( tab ) => {
					if ( tab.name === 'desktop' ) {
						return (
							<>
								<RangeControl
									label={ __( 'Slides to Show', 'sliderberg' ) }
									value={ slidesToShow }
									onChange={ ( value ) =>
										setAttributes( { slidesToShow: value } )
									}
									min={ 1 }
									max={ 6 }
								/>

								<RangeControl
									label={ __( 'Slides to Scroll', 'sliderberg' ) }
									value={ slidesToScroll }
									onChange={ ( value ) =>
										setAttributes( { slidesToScroll: value } )
									}
									min={ 1 }
									max={ slidesToShow }
								/>

								<RangeControl
									label={ __( 'Slide Spacing', 'sliderberg' ) }
									value={ slideSpacing }
									onChange={ ( value ) =>
										setAttributes( { slideSpacing: value } )
									}
									min={ 0 }
									max={ 100 }
									step={ 5 }
								/>
							</>
						);
					} else if ( tab.name === 'tablet' ) {
						return (
							<>
								<Text variant="muted" style={{ marginBottom: '12px', display: 'block' }}>
									{ __( 'Settings for screens 768px - 1024px', 'sliderberg' ) }
								</Text>
								<RangeControl
									label={ __( 'Slides to Show', 'sliderberg' ) }
									value={ tabletSlidesToShow }
									onChange={ ( value ) =>
										setAttributes( { tabletSlidesToShow: value } )
									}
									min={ 1 }
									max={ 4 }
								/>

								<RangeControl
									label={ __( 'Slides to Scroll', 'sliderberg' ) }
									value={ tabletSlidesToScroll }
									onChange={ ( value ) =>
										setAttributes( { tabletSlidesToScroll: value } )
									}
									min={ 1 }
									max={ tabletSlidesToShow }
								/>

								<RangeControl
									label={ __( 'Slide Spacing', 'sliderberg' ) }
									value={ tabletSlideSpacing }
									onChange={ ( value ) =>
										setAttributes( { tabletSlideSpacing: value } )
									}
									min={ 0 }
									max={ 100 }
									step={ 5 }
								/>
							</>
						);
					} else if ( tab.name === 'mobile' ) {
						return (
							<>
								<Text variant="muted" style={{ marginBottom: '12px', display: 'block' }}>
									{ __( 'Settings for screens below 768px', 'sliderberg' ) }
								</Text>
								<RangeControl
									label={ __( 'Slides to Show', 'sliderberg' ) }
									value={ mobileSlidesToShow }
									onChange={ ( value ) =>
										setAttributes( { mobileSlidesToShow: value } )
									}
									min={ 1 }
									max={ 3 }
								/>

								<RangeControl
									label={ __( 'Slides to Scroll', 'sliderberg' ) }
									value={ mobileSlidesToScroll }
									onChange={ ( value ) =>
										setAttributes( { mobileSlidesToScroll: value } )
									}
									min={ 1 }
									max={ mobileSlidesToShow }
								/>

								<RangeControl
									label={ __( 'Slide Spacing', 'sliderberg' ) }
									value={ mobileSlideSpacing }
									onChange={ ( value ) =>
										setAttributes( { mobileSlideSpacing: value } )
									}
									min={ 0 }
									max={ 100 }
									step={ 5 }
								/>
							</>
						);
					}
				} }
			</TabPanel>
		</div>
	);
};