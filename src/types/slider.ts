export interface SliderConfig {
    transitionEffect: 'slide' | 'fade' | 'zoom';
    transitionDuration: number;
    transitionEasing: string;
    autoplay: boolean;
    autoplaySpeed: number;
    pauseOnHover: boolean;
}

export interface SliderState {
    currentSlide: number;
    isAnimating: boolean;
    autoplayInterval: number | null;
}

export interface Slide {
    element: HTMLElement;
    index: number;
}

export interface SlideChangeEvent {
    from: number;
    to: number;
}

export interface FocalPoint {
    x: number;
    y: number;
}

export interface SliderAttributes {
    transitionEffect: SliderConfig['transitionEffect'];
    transitionDuration: number;
    transitionEasing: string;
    autoplay: boolean;
    autoplaySpeed: number;
    pauseOnHover: boolean;
    slides: {
        id: string;
        content: string;
        backgroundImage?: string;
        backgroundPosition?: string;
        backgroundSize?: string;
        backgroundRepeat?: string;
        backgroundColor?: string;
        textColor?: string;
        link?: string;
        linkTarget?: string;
        linkText?: string;
    }[];
} 