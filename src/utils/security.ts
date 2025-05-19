/**
 * Security utilities for SliderBerg
 * Contains validation and sanitization functions for various data types
 */

/**
 * Validates and sanitizes color values
 * @param color - The color value to validate (string or object with hex property)
 * @returns A sanitized color value or default fallback
 */
export function validateColor(color: string | { hex: string }): string {
    const colorValue = typeof color === 'string' ? color : color.hex;
    
    // Basic validation for hex colors
    if (/^#([0-9A-F]{3}){1,2}$/i.test(colorValue)) {
        return colorValue;
    }
    
    // Validation for rgba
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i.test(colorValue)) {
        return colorValue;
    }
    
    return '#000000'; // Default fallback
}

/**
 * Validates media URLs
 * @param media - The media object containing the URL
 * @returns Boolean indicating if the URL is valid
 */
export function isValidMediaUrl(media: { url: string } | null): boolean {
    if (!media || !media.url) return false;
    
    try {
        // Basic URL validation
        new URL(media.url);
        return true;
    } catch (e) {
        console.error('Invalid media URL:', e);
        return false;
    }
}

/**
 * Validates and sanitizes numeric values within a range
 * @param value - The value to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param defaultValue - Default value if validation fails
 * @returns A sanitized number within the specified range
 */
export function validateNumericRange(value: number, min: number, max: number, defaultValue: number): number {
    if (typeof value !== 'number' || isNaN(value)) {
        return defaultValue;
    }
    return Math.min(Math.max(value, min), max);
}

/**
 * Validates content position values
 * @param position - The position value to validate
 * @returns A valid position value or default
 */
export function validateContentPosition(position: string): string {
    const validPositions = [
        'top-left', 'top-center', 'top-right',
        'center-left', 'center-center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right'
    ];
    return validPositions.includes(position) ? position : 'center-center';
}

/**
 * Validates transition effect values
 * @param effect - The effect value to validate
 * @returns A valid effect value or default
 */
export function validateTransitionEffect(effect: string): 'slide' | 'fade' | 'zoom' {
    const validEffects = ['slide', 'fade', 'zoom'];
    return validEffects.includes(effect) ? effect as 'slide' | 'fade' | 'zoom' : 'slide';
}

/**
 * Validates transition easing values
 * @param easing - The easing value to validate
 * @returns A valid easing value or default
 */
export function validateTransitionEasing(easing: string): 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' {
    const validEasings = ['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear'];
    return validEasings.includes(easing) ? easing as 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' : 'ease';
}

/**
 * Sanitizes HTML attribute values
 * @param value - The value to sanitize
 * @returns A sanitized string safe for use in HTML attributes
 */
export function sanitizeAttributeValue(value: string): string {
    return value.replace(/[^\w\s-_.]/g, '');
} 