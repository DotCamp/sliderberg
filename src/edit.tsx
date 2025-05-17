import React, { useState } from 'react';
import { useBlockProps, InnerBlocks, BlockControls, BlockListBlock } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { grid, store, post, plus, chevronLeft, chevronRight } from '@wordpress/icons';
import { Button, PanelBody, SelectControl, RangeControl, ColorPicker } from '@wordpress/components';
import { useDispatch, useSelect, select } from '@wordpress/data';
import { createBlock, getBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';

interface SliderType {
    id: string;
    title: string;
    description: string;
    icon: JSX.Element;
    isPro: boolean;
    isComingSoon?: boolean;
}

const sliderTypes: SliderType[] = [
    {
        id: 'blocks',
        title: __('Blocks Slider', 'sliderberg'),
        description: __('Create a slider with custom blocks', 'sliderberg'),
        icon: <Icon icon={grid} />,
        isPro: false
    },
    {
        id: 'woocommerce',
        title: __('WooCommerce Slider', 'sliderberg'),
        description: __('Showcase your products in a slider', 'sliderberg'),
        icon: <Icon icon={store} />,
        isPro: true
    },
    {
        id: 'posts',
        title: __('Posts Slider', 'sliderberg'),
        description: __('Display your posts in a beautiful slider', 'sliderberg'),
        icon: <Icon icon={post} />,
        isPro: true
    },
    {
        id: 'coming-soon',
        title: __('More Coming Soon', 'sliderberg'),
        description: __('Stay tuned for more slider types', 'sliderberg'),
        icon: <Icon icon={plus} />,
        isPro: false,
        isComingSoon: true
    }
];

const ALLOWED_BLOCKS = ['sliderberg/slide'];

interface EditProps {
    attributes: {
        type: string;
        navigationType: 'split' | 'top' | 'bottom';
        navigationPlacement: 'overlay' | 'outside';
        navigationShape: 'circle' | 'square';
        navigationSize: 'small' | 'medium' | 'large';
        navigationColor: string;
        navigationBgColor: string;
        navigationOpacity: number;
        navigationVerticalPosition: number;
        navigationHorizontalPosition: number;
    };
    setAttributes: (attrs: Partial<EditProps['attributes']>) => void;
}

export const Edit: React.FC<EditProps> = ({ attributes, setAttributes }) => {
    const [currentSlideId, setCurrentSlideId] = useState<string | null>(null);
    const blockProps = useBlockProps();
    const clientId = blockProps['data-block'];

    // Get the current inner blocks for this slider
    const innerBlocks = useSelect(
        (select: any) => clientId ? select('core/block-editor').getBlocks(clientId) : [],
        [clientId]
    );

    // Set the first slide as current by default if not set
    React.useEffect(() => {
        if (innerBlocks.length > 0 && (!currentSlideId || !innerBlocks.find((b: any) => b.clientId === currentSlideId))) {
            setCurrentSlideId(innerBlocks[0].clientId);
        }
        // Ensure correct slide is shown on initial render
        if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
        }
    }, [innerBlocks, currentSlideId]);

    const { insertBlock, selectBlock, removeBlock } = useDispatch('core/block-editor');

    const handleAddSlide = () => {
        const slideBlock = createBlock('sliderberg/slide');
        insertBlock(slideBlock, innerBlocks.length, clientId);
        setTimeout(() => {
            const updatedBlocks = select('core/block-editor').getBlocks(clientId);
            const newBlock = updatedBlocks[updatedBlocks.length - 1];
            if (newBlock) {
                setCurrentSlideId(newBlock.clientId);
                selectBlock(newBlock.clientId);
                if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
                    setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
                }
            }
        }, 50);
    };

    const handleTypeSelect = (typeId: string) => {
        if (sliderTypes.find(type => type.id === typeId)?.isPro || sliderTypes.find(type => type.id === typeId)?.isComingSoon) {
            return;
        }
        setAttributes({ type: typeId });
    };

    const handlePrevSlide = () => {
        if (!currentSlideId || innerBlocks.length === 0) return;
        const idx = innerBlocks.findIndex((b: any) => b.clientId === currentSlideId);
        const prevIdx = idx > 0 ? idx - 1 : innerBlocks.length - 1;
        const newId = innerBlocks[prevIdx].clientId;
        setCurrentSlideId(newId);
        selectBlock(newId);
        if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
        }
    };

    const handleNextSlide = () => {
        if (!currentSlideId || innerBlocks.length === 0) return;
        const idx = innerBlocks.findIndex((b: any) => b.clientId === currentSlideId);
        const nextIdx = idx < innerBlocks.length - 1 ? idx + 1 : 0;
        const newId = innerBlocks[nextIdx].clientId;
        setCurrentSlideId(newId);
        selectBlock(newId);
        if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
        }
    };

    const handleIndicatorClick = (clientId: string) => {
        setCurrentSlideId(clientId);
        selectBlock(clientId);
        if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
            setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
        }
    };

    const handleDeleteSlide = () => {
        if (innerBlocks.length <= 1 || !currentSlideId) return;
        removeBlock(currentSlideId);
        // After deletion, select the previous or next slide
        setTimeout(() => {
            const updatedBlocks = select('core/block-editor').getBlocks(clientId);
            if (updatedBlocks.length > 0) {
                const idx = Math.max(0, updatedBlocks.length - 1);
                setCurrentSlideId(updatedBlocks[idx].clientId);
                selectBlock(updatedBlocks[idx].clientId);
                if (typeof window !== 'undefined' && window.updateSliderbergSlidesVisibility) {
                    setTimeout(() => window.updateSliderbergSlidesVisibility(), 0);
                }
            }
        }, 50);
    };

    const renderTypeSelector = () => (
        <div className="sliderberg-type-selector">
            <h2 className="sliderberg-title">{__('Choose Slider Type', 'sliderberg')}</h2>
            <div className="sliderberg-grid">
                {sliderTypes.map(type => (
                    <div
                        key={type.id}
                        className={`sliderberg-type-card ${type.isPro ? 'is-pro' : ''} ${type.isComingSoon ? 'is-coming-soon' : ''}`}
                        onClick={() => handleTypeSelect(type.id)}
                    >
                        <div className="sliderberg-type-icon">
                            {type.icon}
                        </div>
                        <h3>{type.title}</h3>
                        <p>{type.description}</p>
                        {type.isPro && (
                            <div className="sliderberg-pro-badge">
                                <Icon icon={plus} />
                                {__('Pro', 'sliderberg')}
                            </div>
                        )}
                        {type.isComingSoon && (
                            <div className="sliderberg-coming-soon-badge">
                                {__('Coming Soon', 'sliderberg')}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSliderContent = () => (
        <div className="sliderberg-content">
            <div className="sliderberg-action-buttons">
                <Button
                    variant="primary"
                    className="sliderberg-add-slide"
                    onClick={handleAddSlide}
                >
                    {__('Add Slide', 'sliderberg')}
                </Button>
                <Button
                    variant="secondary"
                    className="sliderberg-delete-slide"
                    onClick={handleDeleteSlide}
                    disabled={innerBlocks.length <= 1}
                    isDestructive
                >
                    {__('Delete Slide', 'sliderberg')}
                </Button>
            </div>
            <div className="sliderberg-slides" style={{ position: 'relative' }}>
                <div className="sliderberg-slides-container" style={{ width: '100%' }} data-current-slide-id={currentSlideId || ''}>
                    <InnerBlocks
                        allowedBlocks={ALLOWED_BLOCKS}
                        template={[['sliderberg/slide', {}]]}
                        templateLock={false}
                        orientation="horizontal"
                    />
                </div>
            </div>
            <div className="sliderberg-navigation"
                data-type={attributes.navigationType}
                data-placement={attributes.navigationPlacement}
                style={{
                    opacity: attributes.navigationOpacity
                }}
            >
                <div className="sliderberg-nav-controls">
                    <Button
                        className="sliderberg-nav-button sliderberg-prev"
                        onClick={handlePrevSlide}
                        icon={chevronLeft}
                        label={__('Previous Slide', 'sliderberg')}
                        data-shape={attributes.navigationShape}
                        data-size={attributes.navigationSize}
                        style={{ 
                            color: attributes.navigationColor,
                            backgroundColor: attributes.navigationBgColor,
                            ...(attributes.navigationType === 'split' && {
                                transform: `translateY(calc(-50% + ${attributes.navigationVerticalPosition}px))`,
                                left: `${attributes.navigationHorizontalPosition}px`
                            })
                        }}
                    />
                    <Button
                        className="sliderberg-nav-button sliderberg-next"
                        onClick={handleNextSlide}
                        icon={chevronRight}
                        label={__('Next Slide', 'sliderberg')}
                        data-shape={attributes.navigationShape}
                        data-size={attributes.navigationSize}
                        style={{ 
                            color: attributes.navigationColor,
                            backgroundColor: attributes.navigationBgColor,
                            ...(attributes.navigationType === 'split' && {
                                transform: `translateY(calc(-50% + ${attributes.navigationVerticalPosition}px))`,
                                right: `${attributes.navigationHorizontalPosition}px`
                            })
                        }}
                    />
                </div>
            </div>
            <div className="sliderberg-slide-indicators">
                {innerBlocks.map((block: any) => (
                    <button
                        key={block.clientId}
                        className={`sliderberg-slide-indicator ${block.clientId === currentSlideId ? 'active' : ''}`}
                        onClick={() => handleIndicatorClick(block.clientId)}
                        aria-label={__('Go to slide', 'sliderberg') + ' ' + (innerBlocks.findIndex((b: any) => b.clientId === block.clientId) + 1)}
                    />
                ))}
            </div>
        </div>
    );

    const renderInspectorControls = () => {
        return (
            <InspectorControls>
                <PanelBody title={__('Navigation Settings', 'sliderberg')} initialOpen={true}>
                    <SelectControl
                        label={__('Navigation Type', 'sliderberg')}
                        value={attributes.navigationType}
                        options={[
                            { label: __('Split Arrows', 'sliderberg'), value: 'split' },
                            { label: __('Top Arrows', 'sliderberg'), value: 'top' },
                            { label: __('Bottom Arrows', 'sliderberg'), value: 'bottom' }
                        ]}
                        onChange={(value) => setAttributes({ navigationType: value as 'split' | 'top' | 'bottom' })}
                    />
                    <SelectControl
                        label={__('Placement', 'sliderberg')}
                        value={attributes.navigationPlacement}
                        options={[
                            { label: __('Overlay', 'sliderberg'), value: 'overlay' },
                            { label: __('Outside Content', 'sliderberg'), value: 'outside' }
                        ]}
                        onChange={(value) => setAttributes({ navigationPlacement: value as 'overlay' | 'outside' })}
                    />
                    <SelectControl
                        label={__('Shape', 'sliderberg')}
                        value={attributes.navigationShape}
                        options={[
                            { label: __('Circle', 'sliderberg'), value: 'circle' },
                            { label: __('Square', 'sliderberg'), value: 'square' }
                        ]}
                        onChange={(value) => setAttributes({ navigationShape: value as 'circle' | 'square' })}
                    />
                    <SelectControl
                        label={__('Size', 'sliderberg')}
                        value={attributes.navigationSize}
                        options={[
                            { label: __('Small', 'sliderberg'), value: 'small' },
                            { label: __('Medium', 'sliderberg'), value: 'medium' },
                            { label: __('Large', 'sliderberg'), value: 'large' }
                        ]}
                        onChange={(value) => setAttributes({ navigationSize: value as 'small' | 'medium' | 'large' })}
                    />
                    <div className="sliderberg-color-controls">
                        <div className="sliderberg-color-control">
                            <label>{__('Arrow Color', 'sliderberg')}</label>
                            <ColorPicker
                                color={attributes.navigationColor}
                                onChangeComplete={(color) => setAttributes({ navigationColor: typeof color === 'string' ? color : color.hex })}
                            />
                        </div>
                        <div className="sliderberg-color-control">
                            <label>{__('Background Color', 'sliderberg')}</label>
                            <ColorPicker
                                color={attributes.navigationBgColor}
                                onChangeComplete={(color) => setAttributes({ navigationBgColor: typeof color === 'string' ? color : color.hex })}
                                enableAlpha
                            />
                        </div>
                    </div>
                    <RangeControl
                        label={__('Opacity', 'sliderberg')}
                        value={attributes.navigationOpacity}
                        onChange={(value) => setAttributes({ navigationOpacity: value })}
                        min={0}
                        max={1}
                        step={0.1}
                    />
                    <RangeControl
                        label={__('Vertical Position', 'sliderberg')}
                        value={attributes.navigationVerticalPosition}
                        onChange={(value) => setAttributes({ navigationVerticalPosition: value })}
                        min={0}
                        max={100}
                        step={1}
                        help={__('Adjust the vertical position of the navigation arrows (in pixels)', 'sliderberg')}
                    />
                    <RangeControl
                        label={__('Horizontal Position', 'sliderberg')}
                        value={attributes.navigationHorizontalPosition}
                        onChange={(value) => setAttributes({ navigationHorizontalPosition: value })}
                        min={0}
                        max={100}
                        step={1}
                        help={__('Adjust the horizontal position of the navigation arrows (in pixels)', 'sliderberg')}
                    />
                </PanelBody>
            </InspectorControls>
        );
    };

    return (
        <div {...blockProps}>
            {renderInspectorControls()}
            {!attributes.type ? renderTypeSelector() : renderSliderContent()}
        </div>
    );
}; 