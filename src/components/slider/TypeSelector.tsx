import React from 'react';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { grid, store, post, plus } from '@wordpress/icons';

interface SliderType {
    id: string;
    title: string;
    description: string;
    icon: JSX.Element;
    isPro: boolean;
    isComingSoon?: boolean;
}

interface TypeSelectorProps {
    onTypeSelect: (typeId: string) => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({ onTypeSelect }) => {
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

    const handleTypeSelect = (typeId: string) => {
        if (sliderTypes.find(type => type.id === typeId)?.isPro || sliderTypes.find(type => type.id === typeId)?.isComingSoon) {
            return;
        }
        onTypeSelect(typeId);
    };

    return (
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
}; 