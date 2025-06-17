/**
 * Shared types for SliderBerg frontend
 */

export interface SliderConfig {
	transitionEffect: 'slide' | 'fade' | 'zoom';
	transitionDuration: number;
	transitionEasing:
		| 'ease'
		| 'ease-in'
		| 'ease-out'
		| 'ease-in-out'
		| 'linear';
	autoplay: boolean;
	autoplaySpeed: number;
	pauseOnHover: boolean;
	// Carousel attributes
	isCarouselMode: boolean;
	slidesToShow: number;
	slidesToScroll: number;
	slideSpacing: number;
	infiniteLoop: boolean;
	// Responsive carousel attributes
	tabletSlidesToShow: number;
	tabletSlidesToScroll: number;
	tabletSlideSpacing: number;
	mobileSlidesToShow: number;
	mobileSlidesToScroll: number;
	mobileSlideSpacing: number;
}

export interface SliderState {
	startIndex: number; // Index of the leftmost visible slide
	currentSlide: number; // For legacy single-slide logic
	isAnimating: boolean;
	autoplayInterval: number | null;
	slideCount: number;
	touchStartX: number;
	touchStartY: number;
	swipeThreshold: number;
	observer: ResizeObserver | null;
	intersectionObserver: IntersectionObserver | null;
	destroyed: boolean;
}

export interface SliderElements {
	container: HTMLElement;
	slides: HTMLElement[];
	prevButton: HTMLElement | null;
	nextButton: HTMLElement | null;
	indicators: HTMLElement | null;
	wrapper: Element;
}
