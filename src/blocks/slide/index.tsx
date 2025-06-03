import React, { useState } from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InnerBlocks,
    InspectorControls,
    MediaUpload,
    MediaUploadCheck,
    BlockControls,
    BlockAlignmentToolbar,
    __experimentalColorGradientSettingsDropdown as ColorGradientSettingsDropdown,
    __experimentalUseMultipleOriginColorsAndGradients as useMultipleOriginColorsAndGradients,
    useSetting
} from '@wordpress/block-editor';
import {
    PanelBody,
    Button,
    RangeControl,
    ColorPicker,
    SelectControl,
    ToggleControl,
    ToolbarGroup,
    ToolbarButton,
    ColorPalette
} from '@wordpress/components';
import './style.css';
import './editor.css';
import classnames from 'classnames';
import { validateColor, isValidMediaUrl, validateNumericRange, validateContentPosition } from '../../utils/security';

interface MediaObject {
    id: number;
    url: string;
}

interface FocalPoint {
    x: number;
    y: number;
}

interface SlideAttributes {
    backgroundType: 'image' | 'color';
    backgroundImage: MediaObject | null;
    backgroundColor: string;
    focalPoint: FocalPoint;
    overlayColor: string;
    overlayOpacity: number;
    minHeight: number;
    contentPosition: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center-center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
    isFixed: boolean;
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
  'core/site-logo'
];

const CONTENT_POSITIONS = [
    { label: __('Top Left', 'sliderberg'), value: 'top-left' },
    { label: __('Top Center', 'sliderberg'), value: 'top-center' },
    { label: __('Top Right', 'sliderberg'), value: 'top-right' },
    { label: __('Center Left', 'sliderberg'), value: 'center-left' },
    { label: __('Center Center', 'sliderberg'), value: 'center-center' },
    { label: __('Center Right', 'sliderberg'), value: 'center-right' },
    { label: __('Bottom Left', 'sliderberg'), value: 'bottom-left' },
    { label: __('Bottom Center', 'sliderberg'), value: 'bottom-center' },
    { label: __('Bottom Right', 'sliderberg'), value: 'bottom-right' },
];

registerBlockType('sliderberg/slide', {
    title: __('Slide', 'sliderberg'),
    description: __('A sophisticated slide with advanced background and content positioning options.', 'sliderberg'),
    category: 'widgets',
    icon: 'cover-image',
    supports: {
        html: false,
        anchor: true,
        inserter: false,
        color: {
            __experimentalDefaultControls: {
                background: true,
            },
        },
    },
    attributes: {
        backgroundType: {
            type: 'string',
            default: ''
        },
        backgroundImage: {
            type: 'object',
            default: null
        },
        backgroundColor: {
            type: 'string',
            default: ''
        },
        focalPoint: {
            type: 'object',
            default: { x: 0.5, y: 0.5 }
        },
        overlayColor: {
            type: 'string',
            default: '#000000'
        },
        overlayOpacity: {
            type: 'number',
            default: 0
        },
        minHeight: {
            type: 'number',
            default: 400
        },
        contentPosition: {
            type: 'string',
            default: 'center-center'
        },
        isFixed: {
            type: 'boolean',
            default: false
        }
    },
    edit: (props: { attributes: SlideAttributes; setAttributes: (attrs: Partial<SlideAttributes>) => void; isSelected: boolean; clientId: string }) => {
        const {
            attributes,
            setAttributes,
            isSelected,
            clientId
        } = props;
        const {
            backgroundType,
            backgroundImage,
            backgroundColor,
            focalPoint,
            overlayColor,
            overlayOpacity,
            minHeight,
            contentPosition,
            isFixed
        } = attributes;

        // Get theme color palette
        const colorSettings = useSetting('color.palette') || [];
        const colorGradientSettings = useMultipleOriginColorsAndGradients();

        // Placeholder UI logic
        const hasBackground = (backgroundType === 'image' && backgroundImage) || (backgroundType === 'color' && backgroundColor);

        const blockProps = useBlockProps({
            className: classnames(
                'sliderberg-slide',
                `sliderberg-content-position-${validateContentPosition(contentPosition)}`,
            ),
            style: {
                minHeight: `${validateNumericRange(minHeight, 100, 1000, 400)}px`,
                backgroundColor: backgroundType === 'color' ? validateColor(backgroundColor) : 'transparent',
                backgroundImage: backgroundType === 'image' && backgroundImage && isValidMediaUrl(backgroundImage) ? 
                    `url(${backgroundImage.url})` : 'none',
                backgroundPosition: backgroundType === 'image' ? 
                    `${validateNumericRange(focalPoint.x * 100, 0, 100, 50)}% ${validateNumericRange(focalPoint.y * 100, 0, 100, 50)}%` : 
                    'center',
                backgroundSize: 'cover',
                backgroundAttachment: isFixed ? 'fixed' : 'scroll'
            },
            'data-client-id': clientId
        });

        // Placeholder UI (like Cover block)
        if (!hasBackground) {
            return (
                <div
                    className={`sliderberg-slide sliderberg-slide-placeholder sliderberg-content-position-${contentPosition}`}
                    data-client-id={clientId}
                    style={{ minHeight: `${minHeight}px` }}
                >
                    <strong>{__('Slide Background', 'sliderberg')}</strong>
                    <p>{__('Drag and drop an image, upload, or choose from your library.', 'sliderberg')}</p>
                    <div className="sliderberg-placeholder-actions">
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={(media: MediaObject) => setAttributes({ backgroundType: 'image', backgroundImage: media })}
                                allowedTypes={['image']}
                                render={({ open }: { open: () => void }) => (
                                    <Button onClick={open} variant="primary">{__('Upload', 'sliderberg')}</Button>
                                )}
                            />
                        </MediaUploadCheck>
                        <MediaUploadCheck>
                            <MediaUpload
                                onSelect={(media: MediaObject) => setAttributes({ backgroundType: 'image', backgroundImage: media })}
                                allowedTypes={['image']}
                                render={({ open }: { open: () => void }) => (
                                    <Button onClick={open}>{__('Media Library', 'sliderberg')}</Button>
                                )}
                            />
                        </MediaUploadCheck>
                    </div>
                    <div className="sliderberg-placeholder-colors">
                        <ColorPalette
                            colors={colorSettings}
                            value={backgroundColor}
                            onChange={(color) => setAttributes({ backgroundType: 'color', backgroundColor: color || '' })}
                            enableAlpha={true}
                            clearable={true}
                        />
                    </div>
                </div>
            );
        }

        return (
            <>
                <InspectorControls>
                    <PanelBody title={__('Layout Settings', 'sliderberg')}>
                        <SelectControl
                            label={__('Content Position', 'sliderberg')}
                            value={contentPosition}
                            options={CONTENT_POSITIONS}
                            onChange={(value) => setAttributes({ contentPosition: value as SlideAttributes['contentPosition'] })}
                        />
                        <RangeControl
                            label={__('Minimum Height', 'sliderberg')}
                            value={minHeight}
                            onChange={(value) => setAttributes({ minHeight: validateNumericRange(value ?? 400, 100, 1000, 400) })}
                            min={100}
                            max={1000}
                            step={10}
                        />
                    </PanelBody>
                    <PanelBody title={__('Background Settings', 'sliderberg')} initialOpen={false}>
                        <SelectControl
                            label={__('Background Type', 'sliderberg')}
                            value={backgroundType}
                            options={[
                                { label: __('Color', 'sliderberg'), value: 'color' },
                                { label: __('Image', 'sliderberg'), value: 'image' }
                            ]}
                            onChange={(value) => setAttributes({ backgroundType: value as 'color' | 'image' })}
                        />
                        {backgroundType === 'color' ? (
                            <ColorPalette
                                colors={colorSettings}
                                value={backgroundColor}
                                onChange={(color) => setAttributes({ backgroundColor: validateColor(color || '') })}
                                enableAlpha={true}
                                clearable={true}
                            />
                        ) : (
                            <MediaUploadCheck>
                                <MediaUpload
                                    onSelect={(media: MediaObject) => setAttributes({ backgroundImage: media })}
                                    allowedTypes={['image']}
                                    value={backgroundImage?.id}
                                    render={({ open }: { open: () => void }) => (
                                        <Button
                                            onClick={open}
                                            variant="secondary"
                                            className="editor-post-featured-image__toggle"
                                        >
                                            {backgroundImage ? __('Replace Image', 'sliderberg') : __('Add Image', 'sliderberg')}
                                        </Button>
                                    )}
                                />
                            </MediaUploadCheck>
                        )}
                        {backgroundType === 'image' && backgroundImage && (
                            <>
                                <ToggleControl
                                    label={__('Fixed Background', 'sliderberg')}
                                    checked={isFixed}
                                    onChange={(value) => setAttributes({ isFixed: value })}
                                />
                                <div className="sliderberg-focal-point-picker">
                                    <label>{__('Focal Point', 'sliderberg')}</label>
                                    <div className="sliderberg-focal-point-grid">
                                        {Array.from({ length: 9 }).map((_, index) => {
                                            const x = (index % 3) / 2;
                                            const y = Math.floor(index / 3) / 2;
                                            return (
                                                <button
                                                    key={index}
                                                    className={`sliderberg-focal-point ${focalPoint.x === x && focalPoint.y === y ? 'is-selected' : ''}`}
                                                    onClick={() => setAttributes({ focalPoint: { x, y } })}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}
                    </PanelBody>
                    <PanelBody title={__('Overlay Settings', 'sliderberg')} initialOpen={false}>
                        <ColorPalette
                            colors={colorSettings}
                            value={overlayColor}
                            onChange={(color) => setAttributes({ overlayColor: validateColor(color || '#000000') })}
                            enableAlpha={true}
                            clearable={false}
                        />
                        <RangeControl
                            label={__('Overlay Opacity', 'sliderberg')}
                            value={overlayOpacity}
                            onChange={(value) => setAttributes({ overlayOpacity: validateNumericRange(value ?? 0.5, 0, 1, 0.5) })}
                            min={0}
                            max={1}
                            step={0.1}
                        />
                    </PanelBody>
                </InspectorControls>
                <div {...blockProps}>
                    <div className="sliderberg-overlay" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
                    <div className="sliderberg-slide-content">
                        <InnerBlocks
                            allowedBlocks={ALLOWED_BLOCKS}
                            template={[
                                ['core/heading', { 
                                    level: 2,
                                    placeholder: __('Add a heading...', 'sliderberg') 
                                }],
                                ['core/paragraph', { 
                                    placeholder: __('Add your content here...', 'sliderberg') 
                                }]
                            ]}
                            templateLock={false}
                        />
                    </div>
                </div>
            </>
        );
    },
    save: ({ attributes }: { attributes: SlideAttributes }) => {
        const {
            backgroundType,
            backgroundImage,
            backgroundColor,
            focalPoint,
            overlayColor,
            overlayOpacity,
            minHeight,
            contentPosition,
            isFixed
        } = attributes;

        const blockProps = useBlockProps.save({
            className: classnames(
                'sliderberg-slide',
                `sliderberg-content-position-${contentPosition}`,
            ),
            style: {
                minHeight: `${minHeight}px`,
                backgroundColor: backgroundType === 'color' ? backgroundColor : 'transparent',
                backgroundImage: backgroundType === 'image' && backgroundImage ? `url(${backgroundImage.url})` : 'none',
                backgroundPosition: backgroundType === 'image' ? `${focalPoint.x * 100}% ${focalPoint.y * 100}%` : 'center',
                backgroundSize: 'cover',
                backgroundAttachment: isFixed ? 'fixed' : 'scroll'
            }
        });

        return (
            <div {...blockProps}>
                <div className="sliderberg-overlay" style={{ backgroundColor: overlayColor, opacity: overlayOpacity }} />
                <div className="sliderberg-slide-content">
                    <InnerBlocks.Content />
                </div>
            </div>
        );
    }
});