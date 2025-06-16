// src/blocks/slide/deprecated.tsx - Slide block deprecations

import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import * as React from 'react';
import classnames from 'classnames';

// Deprecation for v1.0.1 - full HTML save version
const deprecated_v1_0_1 = {
	attributes: {
		backgroundType: {
			type: 'string',
			default: '',
		},
		backgroundImage: {
			type: 'object',
			default: null,
		},
		backgroundColor: {
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
	},
	save: ({ attributes }: any) => {
		const {
			backgroundType,
			backgroundImage,
			backgroundColor,
			focalPoint,
			overlayColor,
			overlayOpacity,
			minHeight,
			contentPosition,
			isFixed,
		} = attributes;

		const blockProps = useBlockProps.save({
			className: classnames(
				'sliderberg-slide',
				`sliderberg-content-position-${contentPosition}`
			),
			style: {
				minHeight: `${minHeight}px`,
				backgroundColor: backgroundType === 'color' ? backgroundColor : 'transparent',
				backgroundImage:
					backgroundType === 'image' && backgroundImage
						? `url(${backgroundImage.url})`
						: 'none',
				backgroundPosition:
					backgroundType === 'image'
						? `${focalPoint.x * 100}% ${focalPoint.y * 100}%`
						: 'center',
				backgroundSize: 'cover',
				backgroundAttachment: isFixed ? 'fixed' : 'scroll',
			},
		});

		return (
			<div {...blockProps}>
				<div
					className="sliderberg-overlay"
					style={{
						backgroundColor: overlayColor,
						opacity: overlayOpacity,
					}}
				/>
				<div className="sliderberg-slide-content">
					<InnerBlocks.Content />
				</div>
			</div>
		);
	},
	migrate: (attributes: any) => {
		// Return all attributes as-is since they match the new structure
		return attributes;
	},
};

// Export all deprecations
export default [deprecated_v1_0_1];