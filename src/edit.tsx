import React, { useState } from 'react';
import { useBlockProps, InnerBlocks, BlockControls, BlockListBlock } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { grid, store, post, plus, chevronLeft, chevronRight } from '@wordpress/icons';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock, getBlockType } from '@wordpress/blocks';

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

export const Edit: React.FC = () => {
    const [selectedType, setSelectedType] = useState<string | null>(null);
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
    }, [innerBlocks, currentSlideId]);

    const { insertBlock, selectBlock } = useDispatch('core/block-editor');

    const handleAddSlide = () => {
        const slideBlock = createBlock('sliderberg/slide');
        insertBlock(slideBlock, innerBlocks.length, clientId);
    };

    const handleTypeSelect = (typeId: string) => {
        if (sliderTypes.find(type => type.id === typeId)?.isPro || sliderTypes.find(type => type.id === typeId)?.isComingSoon) {
            return;
        }
        setSelectedType(typeId);
    };

    const handlePrevSlide = () => {
        if (!currentSlideId || innerBlocks.length === 0) return;
        const idx = innerBlocks.findIndex((b: any) => b.clientId === currentSlideId);
        const prevIdx = idx > 0 ? idx - 1 : innerBlocks.length - 1;
        const newId = innerBlocks[prevIdx].clientId;
        setCurrentSlideId(newId);
        selectBlock(newId);
    };

    const handleNextSlide = () => {
        if (!currentSlideId || innerBlocks.length === 0) return;
        const idx = innerBlocks.findIndex((b: any) => b.clientId === currentSlideId);
        const nextIdx = idx < innerBlocks.length - 1 ? idx + 1 : 0;
        const newId = innerBlocks[nextIdx].clientId;
        setCurrentSlideId(newId);
        selectBlock(newId);
    };

    const handleIndicatorClick = (clientId: string) => {
        setCurrentSlideId(clientId);
        selectBlock(clientId);
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
            <div className="sliderberg-navigation">
                <Button
                    variant="primary"
                    className="sliderberg-add-slide"
                    onClick={handleAddSlide}
                >
                    {__('Add Slide', 'sliderberg')}
                </Button>
                {innerBlocks.length > 1 && (
                    <>
                        <Button
                            className="sliderberg-nav-button sliderberg-prev"
                            onClick={handlePrevSlide}
                            icon={chevronLeft}
                            label={__('Previous Slide', 'sliderberg')}
                        />
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
                        <Button
                            className="sliderberg-nav-button sliderberg-next"
                            onClick={handleNextSlide}
                            icon={chevronRight}
                            label={__('Next Slide', 'sliderberg')}
                        />
                    </>
                )}
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
        </div>
    );

    return (
        <div {...blockProps}>
            {!selectedType ? renderTypeSelector() : renderSliderContent()}
        </div>
    );
}; 