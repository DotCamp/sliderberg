import React from 'react';
import { useBlockProps, InnerBlocks } from '@wordpress/block-editor';

interface SaveProps {
    attributes: {
        type: string;
        navigationType: string;
        navigationPlacement: string;
        navigationOpacity: number;
        navigationBgColor: string;
        navigationShape: string;
        navigationSize: string;
        navigationColor: string;
        navigationVerticalPosition: number;
        navigationHorizontalPosition: number;
        dotColor: string;
        dotActiveColor: string;
        hideDots: boolean;
        transitionEffect: 'slide' | 'fade' | 'zoom';
        transitionDuration: number;
        transitionEasing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
        autoplay: boolean;
        autoplaySpeed: number;
        pauseOnHover: boolean;
        widthPreset: string;
        customWidth: string;
        widthUnit?: string;
    };
}

export const Save: React.FC<SaveProps> = ({ attributes }) => {
    // Custom width logic for frontend
    const customWidthStyle = attributes.widthPreset === 'custom' && attributes.customWidth
        ? { '--sliderberg-custom-width': `${attributes.customWidth}px` } as React.CSSProperties
        : {};

    const blockProps = useBlockProps.save({
        style: {
            '--sliderberg-dot-color': attributes.dotColor,
            '--sliderberg-dot-active-color': attributes.dotActiveColor,
            ...customWidthStyle
        },
        'data-width-preset': attributes.widthPreset
    });

    const renderSlideIndicators = () => {
        if (attributes.hideDots) {
            return null;
        }
        return (
            <div className="sliderberg-slide-indicators">
                {/* Slide indicators will be added dynamically via JavaScript or server-side rendering */}
            </div>
        );
    };

    return (
        <div {...blockProps}>
            {attributes.navigationType === 'top' && (
                <div className="sliderberg-navigation-bar sliderberg-navigation-bar-top">
                    <div className="sliderberg-nav-controls sliderberg-nav-controls-grouped">
                        <button 
                            className="sliderberg-nav-button sliderberg-prev" 
                            aria-label="Previous Slide"
                            data-shape={attributes.navigationShape}
                            data-size={attributes.navigationSize}
                            style={{ 
                                color: attributes.navigationColor,
                                backgroundColor: attributes.navigationBgColor
                            }}
                        >
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z"/>
                            </svg>
                        </button>
                        {renderSlideIndicators()}
                        <button 
                            className="sliderberg-nav-button sliderberg-next" 
                            aria-label="Next Slide"
                            data-shape={attributes.navigationShape}
                            data-size={attributes.navigationSize}
                            style={{ 
                                color: attributes.navigationColor,
                                backgroundColor: attributes.navigationBgColor
                            }}
                        >
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
            <div className="sliderberg-container">
                <div className="sliderberg-slides">
                    <div 
                        className="sliderberg-slides-container"
                        data-transition-effect={attributes.transitionEffect}
                        data-transition-duration={attributes.transitionDuration}
                        data-transition-easing={attributes.transitionEasing}
                        data-autoplay={attributes.autoplay}
                        data-autoplay-speed={attributes.autoplaySpeed}
                        data-pause-on-hover={attributes.pauseOnHover}
                    >
                        <InnerBlocks.Content />
                    </div>
                    {attributes.navigationType === 'split' && (
                        <>
                            <div className="sliderberg-navigation"
                                data-type={attributes.navigationType}
                                data-placement={attributes.navigationPlacement}
                                style={{ opacity: attributes.navigationOpacity }}
                            >
                                <div className="sliderberg-nav-controls">
                                    <button 
                                        className="sliderberg-nav-button sliderberg-prev" 
                                        aria-label="Previous Slide"
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
                                    >
                                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z"/>
                                        </svg>
                                    </button>
                                    <button 
                                        className="sliderberg-nav-button sliderberg-next" 
                                        aria-label="Next Slide"
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
                                    >
                                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            {renderSlideIndicators()}
                        </>
                    )}
                </div>
            </div>
            {attributes.navigationType === 'bottom' && (
                <div className="sliderberg-navigation-bar sliderberg-navigation-bar-bottom">
                    <div className="sliderberg-nav-controls sliderberg-nav-controls-grouped">
                        <button 
                            className="sliderberg-nav-button sliderberg-prev" 
                            aria-label="Previous Slide"
                            data-shape={attributes.navigationShape}
                            data-size={attributes.navigationSize}
                            style={{ 
                                color: attributes.navigationColor,
                                backgroundColor: attributes.navigationBgColor
                            }}
                        >
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z"/>
                            </svg>
                        </button>
                        {renderSlideIndicators()}
                        <button 
                            className="sliderberg-nav-button sliderberg-next" 
                            aria-label="Next Slide"
                            data-shape={attributes.navigationShape}
                            data-size={attributes.navigationSize}
                            style={{ 
                                color: attributes.navigationColor,
                                backgroundColor: attributes.navigationBgColor
                            }}
                        >
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}; 