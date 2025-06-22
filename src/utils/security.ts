/**
 * Security utilities for SliderBerg
 * Contains validation and sanitization functions for various data types
 */

// Extend window interface for sliderbergData
declare global {
	interface Window {
		sliderbergData?: {
			validTransitionEffects?: string[];
		};
	}
}

/**
 * Validates and sanitizes color values
 * @param color - The color value to validate (string or object with hex property)
 * @return A sanitized color value or default fallback
 */
export function validateColor( color: string | { hex: string } ): string {
	const colorValue = typeof color === 'string' ? color : color.hex;

	// Basic validation for hex colors
	if ( /^#([0-9A-F]{3}){1,2}$/i.test( colorValue ) ) {
		return colorValue;
	}

	// Validation for rgba
	if (
		/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/i.test(
			colorValue
		)
	) {
		return colorValue;
	}

	return '#000000'; // Default fallback
}

/**
 * Validates media URLs
 * @param media - The media object containing the URL
 * @return Boolean indicating if the URL is valid
 */
export function isValidMediaUrl( media: { url: string } | null ): boolean {
	if ( ! media || ! media.url ) return false;

	try {
		// Basic URL validation
		new URL( media.url );
		return true;
	} catch ( e ) {
		console.error( 'Invalid media URL:', e );
		return false;
	}
}

/**
 * Validates and sanitizes numeric values within a range
 * @param value        - The value to validate
 * @param min          - Minimum allowed value
 * @param max          - Maximum allowed value
 * @param defaultValue - Default value if validation fails
 * @return A sanitized number within the specified range
 */
export function validateNumericRange(
	value: number,
	min: number,
	max: number,
	defaultValue: number
): number {
	if ( typeof value !== 'number' || isNaN( value ) ) {
		return defaultValue;
	}
	return Math.min( Math.max( value, min ), max );
}

/**
 * Validates content position values
 * @param position - The position value to validate
 * @return A valid position value or default
 */
export function validateContentPosition( position: string ): string {
	const validPositions = [
		'top-left',
		'top-center',
		'top-right',
		'center-left',
		'center-center',
		'center-right',
		'bottom-left',
		'bottom-center',
		'bottom-right',
	];
	return validPositions.includes( position ) ? position : 'center-center';
}

/**
 * Get valid transition effects from PHP
 * This allows the pro plugin to register additional effects via PHP filter
 */
function getValidTransitionEffects(): string[] {
	// Default effects
	const defaultEffects = [ 'slide', 'fade', 'zoom' ];
	
	// Check if additional effects are registered from PHP
	if ( window.sliderbergData && window.sliderbergData.validTransitionEffects ) {
		return window.sliderbergData.validTransitionEffects;
	}
	
	return defaultEffects;
}

/**
 * Validates transition effect values
 * @param effect - The effect value to validate
 * @return A valid effect value or default
 */
export function validateTransitionEffect( effect: string ): string {
	const validEffects = getValidTransitionEffects();
	return validEffects.includes( effect ) ? effect : 'slide';
}

/**
 * Validates transition easing values
 * @param easing - The easing value to validate
 * @return A valid easing value or default
 */
export function validateTransitionEasing(
	easing: string
): 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' {
	const validEasings = [
		'ease',
		'ease-in',
		'ease-out',
		'ease-in-out',
		'linear',
	];
	return validEasings.includes( easing )
		? ( easing as
				| 'ease'
				| 'ease-in'
				| 'ease-out'
				| 'ease-in-out'
				| 'linear' )
		: 'ease';
}

/**
 * Sanitizes HTML attribute values
 * @param value - The value to sanitize
 * @return A sanitized string safe for use in HTML attributes
 */
export function sanitizeAttributeValue( value: string ): string {
	// Remove any potentially dangerous characters
	// Allow only alphanumeric, spaces, hyphens, underscores, periods
	return value.replace( /[^\w\s\-_.]/g, '' );
}

/**
 * Validates and sanitizes DOM element IDs
 * @param id - The ID to validate
 * @return A sanitized ID safe for DOM operations
 */
export function sanitizeDOMId( id: string ): string {
	// DOM IDs must start with a letter and contain only alphanumeric, hyphens, underscores
	const sanitized = id.replace( /[^a-zA-Z0-9\-_]/g, '' );

	// Ensure it starts with a letter
	if ( ! /^[a-zA-Z]/.test( sanitized ) ) {
		return 'slide_' + sanitized;
	}

	return sanitized;
}

/**
 * Validates numeric attributes from DOM
 * @param value        - The value to validate
 * @param min          - Minimum allowed value
 * @param max          - Maximum allowed value
 * @param defaultValue - Default if validation fails
 * @return A validated number
 */
export function validateDOMNumeric(
	value: string | null,
	min: number,
	max: number,
	defaultValue: number
): number {
	if ( ! value ) return defaultValue;

	// Remove any non-numeric characters except decimal point and minus
	const cleaned = value.replace( /[^0-9.\-]/g, '' );
	const parsed = parseFloat( cleaned );

	if ( isNaN( parsed ) || ! isFinite( parsed ) ) {
		return defaultValue;
	}

	return validateNumericRange( parsed, min, max, defaultValue );
}
