import React, { useState } from 'react';
import { useBlockProps, InnerBlocks, BlockControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { grid, store, post, plus } from '@wordpress/icons';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';

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
    const blockProps = useBlockProps();
    const clientId = blockProps['data-block'];

    // Get the current inner blocks for this slider
    const innerBlocks = useSelect(
        (select) => clientId ? select('core/block-editor').getBlocks(clientId) : [],
        [clientId]
    );

    const { insertBlock } = useDispatch('core/block-editor');

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
            <div className="sliderberg-slides">
                <InnerBlocks
                    allowedBlocks={ALLOWED_BLOCKS}
                    template={[['sliderberg/slide', {}]]}
                    templateLock={false}
                    renderAppender={() => (
                        <Button
                            variant="primary"
                            className="sliderberg-add-slide"
                            onClick={handleAddSlide}
                        >
                            {__('Add Slide', 'sliderberg')}
                        </Button>
                    )}
                    orientation="horizontal"
                />
            </div>
        </div>
    );

    return (
        <div {...blockProps}>
            {!selectedType ? renderTypeSelector() : renderSliderContent()}
        </div>
    );
}; 