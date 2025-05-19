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
    dotColor: string;
    dotActiveColor: string;
    transitionEffect: 'slide' | 'fade' | 'zoom';
    transitionDuration: number;
    transitionEasing: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
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