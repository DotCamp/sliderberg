import React from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	InnerBlocks,
	InspectorControls,
	MediaUpload,
	MediaUploadCheck,
	MediaPlaceholder,
	// @ts-ignore - WordPress experimental API
	// eslint-disable-next-line @wordpress/no-unsafe-wp-apis -- Required for color/gradient support across themes
	__experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
	useSetting,
} from '@wordpress/block-editor';
import {
	PanelBody,
	Button,
	RangeControl,
	SelectControl,
	ToggleControl,
	ColorPalette,
	GradientPicker,
} from '@wordpress/components';
import './style.css';
import './editor.css';
import classnames from 'classnames';
import {
	validateColor,
	validateGradient,
	isValidMediaUrl,
	validateNumericRange,
	validateContentPosition,
	validateBorderStyle,
} from '../../utils/security';
import deprecated from './deprecated';

interface MediaObject {
	id: number;
	url: string;
}

interface FocalPoint {
	x: number;
	y: number;
}

interface SlideAttributes {
	backgroundType: 'image' | 'color' | 'gradient';
	backgroundImage: MediaObject | null;
	backgroundColor: string;
	backgroundGradient: string;
	focalPoint: FocalPoint;
	overlayColor: string;
	overlayOpacity: number;
	minHeight: number;
	contentPosition:
		| 'top-left'
		| 'top-center'
		| 'top-right'
		| 'center-left'
		| 'center-center'
		| 'center-right'
		| 'bottom-left'
		| 'bottom-center'
		| 'bottom-right';
	isFixed: boolean;
	borderWidth: number;
	borderColor: string;
	borderStyle: 'solid' | 'dashed' | 'dotted' | 'double';
	borderRadius: number;
}

const ALLOWED_BLOCKS = [
	'core/paragraph',
	'core/heading',
	'core/image',
	'core/gallery',
	'core/list',
	'core/list-item',
	'core/quote',
	'core/audio',
	'core/cover',
	'core/file',
	'core/media-text',
	'core/video',
	'core/button',
	'core/buttons',
	'core/code',
	'core/preformatted',
	'core/pullquote',
	'core/separator',
	'core/spacer',
	'core/table',
	'core/columns',
	'core/column',
	'core/group',
	'core/html',
	'core/shortcode',
	'core/embed',
	'core/block', // reusable block
	'core/more',
	'core/page-break',
	'core/read-more',
	'core/latest-posts',
	'core/categories',
	'core/tag-cloud',
	'core/archives',
	'core/search',
	'core/rss',
	'core/navigation',
	'core/navigation-link',
	'core/social-links',
	'core/social-link',
	'core/site-title',
	'core/site-tagline',
	'core/site-logo',
];

const CONTENT_POSITIONS = [
	{ label: __( 'Top Left', 'sliderberg' ), value: 'top-left' },
	{ label: __( 'Top Center', 'sliderberg' ), value: 'top-center' },
	{ label: __( 'Top Right', 'sliderberg' ), value: 'top-right' },
	{ label: __( 'Center Left', 'sliderberg' ), value: 'center-left' },
	{ label: __( 'Center Center', 'sliderberg' ), value: 'center-center' },
	{ label: __( 'Center Right', 'sliderberg' ), value: 'center-right' },
	{ label: __( 'Bottom Left', 'sliderberg' ), value: 'bottom-left' },
	{ label: __( 'Bottom Center', 'sliderberg' ), value: 'bottom-center' },
	{ label: __( 'Bottom Right', 'sliderberg' ), value: 'bottom-right' },
];

registerBlockType( 'sliderberg/slide', {
	title: __( 'Slide', 'sliderberg' ),
	description: __(
		'A sophisticated slide with advanced background and content positioning options.',
		'sliderberg'
	),
	category: 'widgets',
	icon: 'cover-image',
	supports: {
		html: false,
		anchor: true,
		inserter: false,
	},
	attributes: {
		backgroundType: {
			type: 'string',
			default: 'color' as 'color' | 'image' | 'gradient',
		},
		backgroundImage: {
			type: 'object',
			default: null,
		},
		backgroundColor: {
			type: 'string',
			default: '',
		},
		backgroundGradient: {
			type: 'string',
			default: '',
		},
		focalPoint: {
			type: 'object',
			default: { x: 0.5, y: 0.5 },
		},
		overlayColor: {
			type: 'string',
			default: '#000000',
		},
		overlayOpacity: {
			type: 'number',
			default: 0,
		},
		minHeight: {
			type: 'number',
			default: 400,
		},
		contentPosition: {
			type: 'string',
			default: 'center-center',
		},
		isFixed: {
			type: 'boolean',
			default: false,
		},
		borderWidth: {
			type: 'number',
			default: 0,
		},
		borderColor: {
			type: 'string',
			default: '#000000',
		},
		borderStyle: {
			type: 'string',
			default: 'solid',
		},
		borderRadius: {
			type: 'number',
			default: 0,
		},
	},
	edit: function Edit( props: {
		attributes: SlideAttributes;
		setAttributes: ( attrs: Partial< SlideAttributes > ) => void;
		isSelected: boolean;
		clientId: string;
	} ) {
		const { attributes, setAttributes, clientId } = props;
		const {
			backgroundType,
			backgroundImage,
			backgroundColor,
			backgroundGradient,
			focalPoint,
			overlayColor,
			overlayOpacity,
			minHeight,
			contentPosition,
			isFixed,
			borderWidth,
			borderColor,
			borderStyle,
			borderRadius,
		} = attributes;

		// Get theme color palette
		const colorSettings = useSetting( 'color.palette' ) || [];
		const colorGradientSettings = useMultipleOriginColorsAndGradients();

		// Placeholder UI logic
		const hasBackground =
			( backgroundType === 'image' && backgroundImage ) ||
			( backgroundType === 'color' && backgroundColor ) ||
			( backgroundType === 'gradient' && backgroundGradient ) ||
			// Allow gradient type to show content if there's a previous background to fall back to
			( backgroundType === 'gradient' &&
				( backgroundColor || backgroundImage ) );

		const blockProps = useBlockProps( {
			className: classnames(
				'sliderberg-slide',
				`sliderberg-content-position-${ validateContentPosition(
					contentPosition
				) }`,
				{
					'has-border': borderWidth > 0,
				}
			),
			style: {
				minHeight: `${ validateNumericRange(
					minHeight,
					100,
					1000,
					400
				) }px`,
				backgroundColor: ( () => {
					if ( backgroundType === 'color' ) {
						return validateColor( backgroundColor );
					}
					// Show previous color as fallback when gradient is empty
					if (
						backgroundType === 'gradient' &&
						! backgroundGradient &&
						backgroundColor
					) {
						return validateColor( backgroundColor );
					}
					return 'transparent';
				} )(),
				backgroundImage: ( () => {
					if (
						backgroundType === 'image' &&
						backgroundImage &&
						isValidMediaUrl( backgroundImage )
					) {
						return `url(${ backgroundImage.url })`;
					}
					if ( backgroundType === 'gradient' ) {
						// If gradient exists, use it
						if ( backgroundGradient ) {
							return validateGradient( backgroundGradient );
						}
						// Otherwise, show previous image as fallback if it exists
						if (
							backgroundImage &&
							isValidMediaUrl( backgroundImage )
						) {
							return `url(${ backgroundImage.url })`;
						}
					}
					return 'none';
				} )(),
				backgroundPosition:
					backgroundType === 'image'
						? `${ validateNumericRange(
								focalPoint.x * 100,
								0,
								100,
								50
						  ) }% ${ validateNumericRange(
								focalPoint.y * 100,
								0,
								100,
								50
						  ) }%`
						: 'center',
				backgroundSize: 'cover',
				backgroundAttachment: isFixed ? 'fixed' : 'scroll',
				borderWidth:
					borderWidth > 0
						? `${ validateNumericRange( borderWidth, 0, 50, 0 ) }px`
						: '0',
				borderColor: validateColor( borderColor ),
				borderStyle: validateBorderStyle( borderStyle ),
				borderRadius:
					borderRadius > 0
						? `${ validateNumericRange(
								borderRadius,
								0,
								100,
								0
						  ) }px`
						: '0',
			},
			'data-client-id': clientId,
		} );

		return (
			<>
				<InspectorControls>
					<PanelBody title={ __( 'Layout Settings', 'sliderberg' ) }>
						<SelectControl
							label={ __( 'Content Position', 'sliderberg' ) }
							value={ contentPosition }
							options={ CONTENT_POSITIONS }
							onChange={ ( value ) =>
								setAttributes( {
									contentPosition:
										value as SlideAttributes[ 'contentPosition' ],
								} )
							}
						/>
						<RangeControl
							label={ __( 'Minimum Height', 'sliderberg' ) }
							value={ minHeight }
							onChange={ ( value ) =>
								setAttributes( {
									minHeight: validateNumericRange(
										value ?? 400,
										100,
										1000,
										400
									),
								} )
							}
							min={ 100 }
							max={ 1000 }
							step={ 10 }
						/>
					</PanelBody>
					<PanelBody
						title={ __( 'Background Settings', 'sliderberg' ) }
						initialOpen={ true }
					>
						<SelectControl
							label={ __( 'Background Type', 'sliderberg' ) }
							value={ backgroundType }
							options={ [
								{
									label: __( 'Color', 'sliderberg' ),
									value: 'color',
								},
								{
									label: __( 'Gradient', 'sliderberg' ),
									value: 'gradient',
								},
								{
									label: __( 'Image', 'sliderberg' ),
									value: 'image',
								},
							] }
							onChange={ ( value ) =>
								setAttributes( {
									backgroundType: value as
										| 'color'
										| 'image'
										| 'gradient',
								} )
							}
						/>
						{ ( () => {
							if ( backgroundType === 'color' ) {
								return (
									<ColorPalette
										colors={ colorSettings }
										value={ backgroundColor }
										onChange={ ( color ) =>
											setAttributes( {
												backgroundColor: validateColor(
													color || ''
												),
											} )
										}
										enableAlpha={ true }
										clearable={ true }
									/>
								);
							}
							if ( backgroundType === 'gradient' ) {
								return (
									<GradientPicker
										value={ backgroundGradient || null }
										onChange={ ( gradient ) =>
											setAttributes( {
												backgroundGradient:
													validateGradient(
														gradient || ''
													),
											} )
										}
										gradients={
											colorGradientSettings?.gradients ||
											[]
										}
									/>
								);
							}
							return (
								<MediaUploadCheck>
									<MediaUpload
										onSelect={ ( media: MediaObject ) =>
											setAttributes( {
												backgroundImage: media,
											} )
										}
										allowedTypes={ [ 'image' ] }
										value={ backgroundImage?.id }
										render={ ( {
											open,
										}: {
											open: () => void;
										} ) => (
											<Button
												onClick={ open }
												variant="secondary"
												className="editor-post-featured-image__toggle"
											>
												{ backgroundImage
													? __(
															'Replace Image',
															'sliderberg'
													  )
													: __(
															'Add Image',
															'sliderberg'
													  ) }
											</Button>
										) }
									/>
								</MediaUploadCheck>
							);
						} )() }
						{ backgroundType === 'image' && backgroundImage && (
							<>
								<div style={ { marginTop: '16px' } }>
									<ToggleControl
										label={ __(
											'Fixed Background',
											'sliderberg'
										) }
										checked={ isFixed }
										onChange={ ( value ) =>
											setAttributes( { isFixed: value } )
										}
									/>
								</div>
								<div className="sliderberg-focal-point-picker">
									<label htmlFor="focal-point-grid">
										{ __( 'Focal Point', 'sliderberg' ) }
									</label>
									<div
										id="focal-point-grid"
										className="sliderberg-focal-point-grid"
										role="group"
										aria-labelledby="focal-point-grid"
									>
										{ Array.from( { length: 9 } ).map(
											( _, index ) => {
												const x = ( index % 3 ) / 2;
												const y =
													Math.floor( index / 3 ) / 2;
												return (
													<button
														key={ index }
														className={ `sliderberg-focal-point ${
															focalPoint.x ===
																x &&
															focalPoint.y === y
																? 'is-selected'
																: ''
														}` }
														onClick={ () =>
															setAttributes( {
																focalPoint: {
																	x,
																	y,
																},
															} )
														}
													/>
												);
											}
										) }
									</div>
								</div>
							</>
						) }
					</PanelBody>
					<PanelBody
						title={ __( 'Overlay Settings', 'sliderberg' ) }
						initialOpen={ false }
					>
						<ColorPalette
							colors={ colorSettings }
							value={ overlayColor }
							onChange={ ( color ) =>
								setAttributes( {
									overlayColor: validateColor(
										color || '#000000'
									),
								} )
							}
							enableAlpha={ true }
							clearable={ false }
						/>
						<div style={ { marginTop: '16px' } }>
							<RangeControl
								label={ __( 'Overlay Opacity', 'sliderberg' ) }
								value={ overlayOpacity }
								onChange={ ( value ) =>
									setAttributes( {
										overlayOpacity: validateNumericRange(
											value ?? 0.5,
											0,
											1,
											0.5
										),
									} )
								}
								min={ 0 }
								max={ 1 }
								step={ 0.1 }
							/>
						</div>
					</PanelBody>
					<PanelBody
						title={ __( 'Border & Radius Settings', 'sliderberg' ) }
						initialOpen={ false }
					>
						<RangeControl
							label={ __( 'Border Width', 'sliderberg' ) }
							value={ borderWidth }
							onChange={ ( value ) =>
								setAttributes( {
									borderWidth: validateNumericRange(
										value ?? 0,
										0,
										50,
										0
									),
								} )
							}
							min={ 0 }
							max={ 50 }
							step={ 1 }
						/>
						{ borderWidth > 0 && (
							<>
								<ColorPalette
									colors={ colorSettings }
									value={ borderColor }
									onChange={ ( color ) =>
										setAttributes( {
											borderColor: validateColor(
												color || '#000000'
											),
										} )
									}
									enableAlpha={ true }
									clearable={ false }
								/>
								<div style={ { marginTop: '16px' } }>
									<SelectControl
										label={ __(
											'Border Style',
											'sliderberg'
										) }
										value={ borderStyle }
										options={ [
											{
												label: __(
													'Solid',
													'sliderberg'
												),
												value: 'solid',
											},
											{
												label: __(
													'Dashed',
													'sliderberg'
												),
												value: 'dashed',
											},
											{
												label: __(
													'Dotted',
													'sliderberg'
												),
												value: 'dotted',
											},
											{
												label: __(
													'Double',
													'sliderberg'
												),
												value: 'double',
											},
										] }
										onChange={ ( value ) =>
											setAttributes( {
												borderStyle: value as
													| 'solid'
													| 'dashed'
													| 'dotted'
													| 'double',
											} )
										}
									/>
								</div>
							</>
						) }
						<div style={ { marginTop: '16px' } }>
							<RangeControl
								label={ __( 'Border Radius', 'sliderberg' ) }
								value={ borderRadius }
								onChange={ ( value ) =>
									setAttributes( {
										borderRadius: validateNumericRange(
											value ?? 0,
											0,
											100,
											0
										),
									} )
								}
								min={ 0 }
								max={ 100 }
								step={ 1 }
							/>
						</div>
					</PanelBody>
				</InspectorControls>
				{ ! hasBackground ? (
					<div
						className={ classnames(
							'sliderberg-slide',
							'sliderberg-slide-placeholder',
							`sliderberg-content-position-${ contentPosition }`,
							{
								'has-border': borderWidth > 0,
							}
						) }
						data-client-id={ clientId }
						style={ {
							minHeight: `${ minHeight }px`,
							borderWidth:
								borderWidth > 0
									? `${ validateNumericRange(
											borderWidth,
											0,
											50,
											0
									  ) }px`
									: '0',
							borderColor: validateColor( borderColor ),
							borderStyle: validateBorderStyle( borderStyle ),
							borderRadius:
								borderRadius > 0
									? `${ validateNumericRange(
											borderRadius,
											0,
											100,
											0
									  ) }px`
									: '0',
						} }
					>
						<MediaPlaceholder
							icon="format-image"
							labels={ {
								title: __( 'Slide Background', 'sliderberg' ),
								instructions: __(
									'Drag and drop an image, upload, or choose from your library.',
									'sliderberg'
								),
							} }
							onSelect={ ( media: MediaObject ) =>
								setAttributes( {
									backgroundType: 'image',
									backgroundImage: media,
								} )
							}
							accept="image/*"
							allowedTypes={ [ 'image' ] }
						/>
						<div className="sliderberg-placeholder-colors">
							<p>
								{ __(
									'Or choose a background color:',
									'sliderberg'
								) }
							</p>
							<ColorPalette
								colors={ colorSettings }
								value={ backgroundColor }
								onChange={ ( color ) =>
									setAttributes( {
										backgroundType: 'color',
										backgroundColor: color || '',
									} )
								}
								enableAlpha={ true }
								clearable={ true }
							/>
						</div>
					</div>
				) : (
					<div { ...blockProps }>
						<div
							className="sliderberg-overlay"
							style={ {
								backgroundColor: overlayColor,
								opacity: overlayOpacity,
							} }
						/>
						<div className="sliderberg-slide-content">
							<InnerBlocks
								allowedBlocks={ ALLOWED_BLOCKS }
								template={ [
									[
										'core/heading',
										{
											level: 2,
											placeholder: __(
												'Add a heading…',
												'sliderberg'
											),
										},
									],
									[
										'core/paragraph',
										{
											placeholder: __(
												'Add your content here…',
												'sliderberg'
											),
										},
									],
								] }
								templateLock={ false }
							/>
						</div>
					</div>
				) }
			</>
		);
	},
	save: () => {
		return <InnerBlocks.Content />;
	},
	deprecated,
} );
