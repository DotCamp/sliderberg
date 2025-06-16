import React from 'react';
import { __ } from '@wordpress/i18n';
import {
	SelectControl,
	RangeControl,
	ColorPicker,
	ToggleControl,
	ColorPalette,
} from '@wordpress/components';
import { validateColor, validateNumericRange } from '../../../utils/security';
import { SliderAttributes } from '../../../types/slider';

interface NavigationSettingsProps {
	attributes: SliderAttributes;
	setAttributes: ( attrs: Partial< SliderAttributes > ) => void;
}

export const NavigationSettings: React.FC< NavigationSettingsProps > = ( {
	attributes,
	setAttributes,
} ) => {
	return (
		<>
			<SelectControl
				label={ __( 'Navigation Type', 'sliderberg' ) }
				value={ attributes.navigationType }
				options={ [
					{
						label: __( 'Split Arrows', 'sliderberg' ),
						value: 'split',
					},
					{ label: __( 'Top Arrows', 'sliderberg' ), value: 'top' },
					{
						label: __( 'Bottom Arrows', 'sliderberg' ),
						value: 'bottom',
					},
				] }
				onChange={ ( value ) =>
					setAttributes( { navigationType: value } )
				}
			/>
			<SelectControl
				label={ __( 'Placement', 'sliderberg' ) }
				value={ attributes.navigationPlacement }
				options={ [
					{ label: __( 'Overlay', 'sliderberg' ), value: 'overlay' },
					{
						label: __( 'Outside Content', 'sliderberg' ),
						value: 'outside',
					},
				] }
				onChange={ ( value ) =>
					setAttributes( { navigationPlacement: value } )
				}
				disabled={
					attributes.navigationType === 'top' ||
					attributes.navigationType === 'bottom'
				}
			/>
			<SelectControl
				label={ __( 'Shape', 'sliderberg' ) }
				value={ attributes.navigationShape }
				options={ [
					{ label: __( 'Circle', 'sliderberg' ), value: 'circle' },
					{ label: __( 'Square', 'sliderberg' ), value: 'square' },
				] }
				onChange={ ( value ) =>
					setAttributes( { navigationShape: value } )
				}
			/>
			<SelectControl
				label={ __( 'Size', 'sliderberg' ) }
				value={ attributes.navigationSize }
				options={ [
					{ label: __( 'Small', 'sliderberg' ), value: 'small' },
					{ label: __( 'Medium', 'sliderberg' ), value: 'medium' },
					{ label: __( 'Large', 'sliderberg' ), value: 'large' },
				] }
				onChange={ ( value ) =>
					setAttributes( { navigationSize: value } )
				}
			/>
			<div className="sliderberg-color-controls">
				<div className="sliderberg-color-control">
					<label>{ __( 'Arrow Color', 'sliderberg' ) }</label>
					<ColorPalette
						value={ attributes.navigationColor }
						onChange={ ( color ) =>
							setAttributes( {
								navigationColor: validateColor( color || '' ),
							} )
						}
						disableCustomColors={ false }
					/>
				</div>
				<div className="sliderberg-color-control">
					<label>{ __( 'Background Color', 'sliderberg' ) }</label>
					<ColorPalette
						value={ attributes.navigationBgColor }
						onChange={ ( color ) =>
							setAttributes( {
								navigationBgColor: validateColor( color || '' ),
							} )
						}
						disableCustomColors={ false }
					/>
				</div>
			</div>
			<RangeControl
				label={ __( 'Opacity', 'sliderberg' ) }
				value={ attributes.navigationOpacity }
				onChange={ ( value ) =>
					setAttributes( {
						navigationOpacity: validateNumericRange(
							value ?? 1,
							0,
							1,
							1
						),
					} )
				}
				min={ 0 }
				max={ 1 }
				step={ 0.1 }
			/>
			<RangeControl
				label={ __( 'Vertical Position', 'sliderberg' ) }
				value={ attributes.navigationVerticalPosition }
				onChange={ ( value ) =>
					setAttributes( {
						navigationVerticalPosition: validateNumericRange(
							value ?? 20,
							0,
							100,
							20
						),
					} )
				}
				min={ 0 }
				max={ 100 }
				step={ 1 }
				help={ __(
					'Adjust the vertical position of the navigation arrows (in pixels)',
					'sliderberg'
				) }
				disabled={ attributes.navigationType !== 'split' }
			/>
			<RangeControl
				label={ __( 'Horizontal Position', 'sliderberg' ) }
				value={ attributes.navigationHorizontalPosition }
				onChange={ ( value ) =>
					setAttributes( {
						navigationHorizontalPosition: validateNumericRange(
							value ?? 20,
							0,
							100,
							20
						),
					} )
				}
				min={ 0 }
				max={ 100 }
				step={ 1 }
				help={ __(
					'Adjust the horizontal position of the navigation arrows (in pixels)',
					'sliderberg'
				) }
				disabled={ attributes.navigationType !== 'split' }
			/>
			<ToggleControl
				label={ __( 'Hide Dots', 'sliderberg' ) }
				checked={ attributes.hideDots }
				onChange={ ( value ) => setAttributes( { hideDots: value } ) }
				help={ __( 'Hide the slide indicator dots', 'sliderberg' ) }
			/>
			{ ! attributes.hideDots && (
				<>
					<div className="sliderberg-dot-colors">
						<p className="components-base-control__label">
							{ __( 'Dot Color', 'sliderberg' ) }
						</p>
						<ColorPalette
							value={ attributes.dotColor }
							onChange={ ( color ) =>
								setAttributes( {
									dotColor: validateColor( color || '' ),
								} )
							}
							disableCustomColors={ false }
						/>
					</div>
					<div className="sliderberg-dot-colors">
						<p className="components-base-control__label">
							{ __( 'Active Dot Color', 'sliderberg' ) }
						</p>
						<ColorPalette
							value={ attributes.dotActiveColor }
							onChange={ ( color ) =>
								setAttributes( {
									dotActiveColor: validateColor( color || '' ),
								} )
							}
							disableCustomColors={ false }
						/>
					</div>
				</>
			) }
		</>
	);
};
