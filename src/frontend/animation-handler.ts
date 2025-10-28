/**
 * Animation handler for SliderBerg
 * Effect registry pattern: delegates behavior to effect classes
 */

import { SliderConfig, SliderState, SliderElements } from './types';

type Direction = 'next' | 'prev' | null;

interface Effect {
  setupLayout(): void;
  gotoSlide(index: number, direction: Direction): void;
  updateContainerHeight(): void;
  cleanup(): void;
  getVisibleSlideIndex(): number;
}

abstract class BaseEffect implements Effect {
  protected config: SliderConfig;
  protected state: SliderState;
  protected elements: SliderElements;
  private activeTimeouts: Set<number> = new Set();

  constructor(config: SliderConfig, state: SliderState, elements: SliderElements) {
    this.config = config;
    this.state = state;
    this.elements = elements;
  }

  // Default no-ops to satisfy interface; subclasses override as needed
  setupLayout(): void {}
  gotoSlide(_index: number, _direction: Direction): void {}
  updateContainerHeight(): void {}

  cleanup(): void {
    this.activeTimeouts.forEach((id) => clearTimeout(id));
    this.activeTimeouts.clear();
  }

  protected safeSetTimeout(callback: () => void, delay: number): number {
    const timeoutId = window.setTimeout(() => {
      this.activeTimeouts.delete(timeoutId);
      if (!this.state.destroyed) callback();
    }, delay);
    this.activeTimeouts.add(timeoutId);
    return timeoutId;
  }

  protected scheduleAnimationReset(): void {
    this.safeSetTimeout(() => {
      this.state.isAnimating = false;
    }, this.config.transitionDuration + 50);
  }

  protected getTransitionString(): string {
    const { transitionDuration, transitionEasing } = this.config;
    return `${transitionDuration}ms ${transitionEasing}`;
  }

  protected getResponsiveSettings(): { slidesToShow: number; slidesToScroll: number; slideSpacing: number } {
    const viewportWidth = window.innerWidth;
    const c = this.config;
    if (viewportWidth < 768) {
      return {
        slidesToShow: c.mobileSlidesToShow,
        slidesToScroll: c.mobileSlidesToScroll,
        slideSpacing: c.mobileSlideSpacing,
      };
    } else if (viewportWidth >= 768 && viewportWidth < 1024) {
      return {
        slidesToShow: c.tabletSlidesToShow,
        slidesToScroll: c.tabletSlidesToScroll,
        slideSpacing: c.tabletSlideSpacing,
      };
    }
    return {
      slidesToShow: c.slidesToShow,
      slidesToScroll: c.slidesToScroll,
      slideSpacing: c.slideSpacing,
    };
  }

  getVisibleSlideIndex(): number {
    return this.state.currentSlide;
  }
}

class SlideEffect extends BaseEffect {
  setupLayout(): void {
    const { container, slides } = this.elements;
    const { isCarouselMode, infiniteLoop } = this.config;
    const { slidesToShow, slideSpacing } = this.getResponsiveSettings();

    if (isCarouselMode && slidesToShow > 1 && infiniteLoop) {
      Array.from(container.querySelectorAll('.sliderberg-clone')).forEach((clone) => clone.remove());
      for (let i = slides.length - slidesToShow; i < slides.length; i++) {
        const clone = slides[i].cloneNode(true) as HTMLElement;
        clone.classList.add('sliderberg-clone');
        container.insertBefore(clone, container.firstChild);
      }
      for (let i = 0; i < slidesToShow; i++) {
        const clone = slides[i].cloneNode(true) as HTMLElement;
        clone.classList.add('sliderberg-clone');
        container.appendChild(clone);
      }
      container.style.display = 'flex';
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.gap = `${slideSpacing}px`;
      const allSlides = Array.from(container.children) as HTMLElement[];
      allSlides.forEach((slide) => {
        slide.style.flex = `0 0 calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
        slide.style.width = `calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
        slide.style.minWidth = `calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
      });
      container.style.transform = `translateX(-${slidesToShow * (100 / slidesToShow)}%)`;
      this.state.startIndex = 0;
    } else if (isCarouselMode && slidesToShow > 1) {
      container.style.display = 'flex';
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.transform = 'translateX(0)';
      container.style.gap = `${slideSpacing}px`;
      slides.forEach((slide) => {
        slide.style.flex = `0 0 calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
        slide.style.width = `calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
        slide.style.minWidth = `calc((100% - ${(slidesToShow - 1) * slideSpacing}px) / ${slidesToShow})`;
      });
    } else {
      container.style.display = 'flex';
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.transform = 'translateX(0)';
      slides.forEach((slide) => {
        slide.style.flex = '0 0 100%';
        slide.style.width = '100%';
        slide.style.minWidth = '100%';
      });
      if (slides.length > 1) {
        this.setupCloneSlides();
      }
    }
  }

  gotoSlide(index: number, direction: Direction): void {
    const { isCarouselMode, infiniteLoop } = this.config;
    const { slidesToShow } = this.getResponsiveSettings();
    const { container } = this.elements;
    const realSlides = this.elements.slides.length;
    let targetIndex = index;

    if (isCarouselMode && slidesToShow > 1 && infiniteLoop) {
      const totalSlides = realSlides;
      const cloneCount = slidesToShow;
      const visualIndex = targetIndex + cloneCount;
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.transform = `translateX(-${visualIndex * (100 / slidesToShow)}%)`;
      this.state.startIndex = targetIndex;
      const onTransitionEnd = () => {
        container.removeEventListener('transitionend', onTransitionEnd);
        if (targetIndex < 0) {
          this.state.startIndex = totalSlides - slidesToShow;
          container.style.transition = 'none';
          container.style.transform = `translateX(-${(this.state.startIndex + cloneCount) * (100 / slidesToShow)}%)`;
          // Force reflow
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          (container as any).offsetHeight;
          container.style.transition = `transform ${this.getTransitionString()}`;
        } else if (targetIndex >= totalSlides) {
          this.state.startIndex = 0;
          container.style.transition = 'none';
          container.style.transform = `translateX(-${cloneCount * (100 / slidesToShow)}%)`;
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          (container as any).offsetHeight;
          container.style.transition = `transform ${this.getTransitionString()}`;
        }
        this.state.isAnimating = false;
      };
      container.addEventListener('transitionend', onTransitionEnd);
    } else if (isCarouselMode && slidesToShow > 1) {
      const totalSlides = realSlides;
      targetIndex = Math.max(0, Math.min(index, totalSlides - slidesToShow));
      this.state.startIndex = targetIndex;
      container.style.transition = `transform ${this.getTransitionString()}`;
      container.style.transform = `translateX(-${targetIndex * (100 / slidesToShow)}%)`;
      this.state.isAnimating = false;
    } else {
      if (direction === null) {
        this.state.currentSlide = index + 1; // Adjust for clones
        container.style.transition = `transform ${this.getTransitionString()}`;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
        this.scheduleAnimationReset();
      } else if (direction === 'next') {
        this.handleNextSlideTransition();
      } else if (direction === 'prev') {
        this.handlePrevSlideTransition();
      }
    }
  }

  private handleNextSlideTransition(): void {
    const { container, slides } = this.elements;
    const { transitionDuration } = this.config;
    this.state.currentSlide++;
    container.style.transition = `transform ${this.getTransitionString()}`;
    container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
    if (this.state.currentSlide === slides.length + 1) {
      this.safeSetTimeout(() => {
        container.style.transition = 'none';
        this.state.currentSlide = 1;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (container as any).offsetHeight;
        this.safeSetTimeout(() => {
          container.style.transition = `transform ${this.getTransitionString()}`;
          this.state.isAnimating = false;
        }, 10);
      }, transitionDuration);
    } else {
      this.scheduleAnimationReset();
    }
  }

  private handlePrevSlideTransition(): void {
    const { container, slides } = this.elements;
    const { transitionDuration } = this.config;
    this.state.currentSlide--;
    container.style.transition = `transform ${this.getTransitionString()}`;
    container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
    if (this.state.currentSlide === 0) {
      this.safeSetTimeout(() => {
        container.style.transition = 'none';
        this.state.currentSlide = slides.length;
        container.style.transform = `translateX(-${this.state.currentSlide * 100}%)`;
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        (container as any).offsetHeight;
        this.safeSetTimeout(() => {
          container.style.transition = `transform ${this.getTransitionString()}`;
          this.state.isAnimating = false;
        }, 10);
      }, transitionDuration);
    } else {
      this.scheduleAnimationReset();
    }
  }

  private setupCloneSlides(): void {
    const { container, slides } = this.elements;
    if (slides.length <= 1) return;
    const firstSlideClone = slides[0].cloneNode(true) as HTMLElement;
    const lastSlideClone = slides[slides.length - 1].cloneNode(true) as HTMLElement;
    firstSlideClone.setAttribute('aria-hidden', 'true');
    lastSlideClone.setAttribute('aria-hidden', 'true');
    firstSlideClone.classList.add('sliderberg-clone');
    lastSlideClone.classList.add('sliderberg-clone');
    firstSlideClone.setAttribute('data-clone-of', '0');
    lastSlideClone.setAttribute('data-clone-of', (slides.length - 1).toString());
    container.appendChild(firstSlideClone);
    container.insertBefore(lastSlideClone, slides[0]);
    container.style.transform = 'translateX(-100%)';
    this.state.currentSlide = 1;
  }

  getVisibleSlideIndex(): number {
    const slideCount = this.elements.slides.length;
    if (slideCount > 1) {
      if (this.state.currentSlide === 0) return slideCount - 1;
      if (this.state.currentSlide === slideCount + 1) return 0;
      return this.state.currentSlide - 1;
    }
    return this.state.currentSlide;
  }
}

class FadeEffect extends BaseEffect {
  setupLayout(): void {
    const { container, slides } = this.elements;
    container.style.display = 'block';
    container.style.position = 'relative';
    container.style.transition = 'none';
    if (slides[0]) this.updateContainerHeight();
    slides.forEach((slide, index) => {
      slide.style.position = 'absolute';
      slide.style.top = '0';
      slide.style.left = '0';
      slide.style.width = '100%';
      slide.style.height = '100%';
      slide.style.opacity = index === 0 ? '1' : '0';
      slide.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
      slide.style.zIndex = index === 0 ? '1' : '0';
      slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
      slide.style.visibility = 'visible';
      slide.style.display = 'block';
    });
  }

  gotoSlide(index: number, direction: Direction): void {
    const { slides } = this.elements;
    const prevIndex = this.getVisibleSlideIndex();
    this.state.currentSlide = index;
    const current = slides[this.state.currentSlide];
    const previous = slides[prevIndex];
    if (!current || !previous) {
      this.state.isAnimating = false;
      return;
    }
    previous.style.zIndex = '0';
    current.style.zIndex = '1';
    previous.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
    current.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
    previous.style.opacity = '0';
    current.style.opacity = '0';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (current as any).offsetHeight;
    current.style.opacity = '1';
    this.updateContainerHeight();
    this.scheduleAnimationReset();
  }

  updateContainerHeight(): void {
    const { container, slides } = this.elements;
    const currentActiveSlide = slides[this.getVisibleSlideIndex()];
    if (!currentActiveSlide) return;
    const slideHeight = currentActiveSlide.offsetHeight;
    if (slideHeight > 0) {
      container.style.height = `${slideHeight}px`;
    } else {
      const slideMinHeight = getComputedStyle(currentActiveSlide).minHeight;
      container.style.height = slideMinHeight && slideMinHeight !== '0px' ? slideMinHeight : '400px';
    }
  }
}

class ZoomEffect extends FadeEffect {
  // Override only parts that differ
  gotoSlide(index: number, direction: Direction): void {
    const { slides } = this.elements;
    const prevIndex = this.getVisibleSlideIndex();
    this.state.currentSlide = index;
    const current = slides[this.state.currentSlide];
    const previous = slides[prevIndex];
    if (!current || !previous) {
      this.state.isAnimating = false;
      return;
    }
    previous.style.zIndex = '0';
    current.style.zIndex = '1';
    previous.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
    current.style.transition = `opacity ${this.getTransitionString()}, transform ${this.getTransitionString()}`;
    previous.style.opacity = '0';
    previous.style.transform = direction === 'next' ? 'scale(0.95)' : 'scale(1.05)';
    current.style.opacity = '0';
    current.style.transform = direction === 'next' ? 'scale(1.05)' : 'scale(0.95)';
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    (current as any).offsetHeight;
    current.style.opacity = '1';
    current.style.transform = 'scale(1)';
    this.updateContainerHeight();
    this.scheduleAnimationReset();
  }
}

export class AnimationHandler {
  private effect: Effect;

  constructor(private config: SliderConfig, private state: SliderState, private elements: SliderElements) {
    switch (config.transitionEffect) {
      case 'fade':
        this.effect = new FadeEffect(config, state, elements);
        break;
      case 'zoom':
        this.effect = new ZoomEffect(config, state, elements);
        break;
      case 'slide':
      default:
        this.effect = new SlideEffect(config, state, elements);
        break;
    }
  }

  setupSliderLayout(): void {
    this.effect.setupLayout();
  }

  handleSlideTransition(index: number, direction: Direction): void {
    this.effect.gotoSlide(index, direction);
  }

  updateContainerHeight(): void {
    this.effect.updateContainerHeight();
  }

  cleanup(): void {
    this.effect.cleanup();
  }

  getVisibleSlideIndex(): number {
    return this.effect.getVisibleSlideIndex();
  }
}
