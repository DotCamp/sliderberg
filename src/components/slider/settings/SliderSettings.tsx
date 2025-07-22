import React, { useEffect, useState } from 'react';
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
import { ReviewRequest } from '../../shared/ReviewRequest';
import { useSaveTracking } from '../../../hooks/useSaveTracking';
import { reviewStateManager } from '../../../utils/reviewState';

interface SliderSettingsProps {
	attributes: SliderAttributes;
	setAttributes: ( attrs: Partial< SliderAttributes > ) => void;
}

export const SliderSettings: React.FC< SliderSettingsProps > = ( {
	attributes,
	setAttributes,
} ) => {
	// Review notification state
	const [ showReviewNotice, setShowReviewNotice ] = useState( false );

	// Track saves and manage review notification
	useSaveTracking( {
		blockName: 'sliderberg/sliderberg',
		onSaveComplete: () => {
			reviewStateManager.incrementSaveCount();

			if ( reviewStateManager.shouldShowNotice() ) {
				setShowReviewNotice( true );
				reviewStateManager.markAsShown();
			}
		},
	} );

	const handleReviewDismiss = ( permanent: boolean ) => {
		setShowReviewNotice( false );
		reviewStateManager.dismiss( permanent );
	};
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
			{ /* Show review notification at the top of sidebar */ }
			{ showReviewNotice && (
				<div className="sliderberg-sidebar-review-wrapper">
					<ReviewRequest onDismiss={ handleReviewDismiss } />
				</div>
			) }

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
