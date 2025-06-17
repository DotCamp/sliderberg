<?php
/**
 * Security utilities for SliderBerg
 * 
 * @package SliderBerg
 * @since 1.0.3
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Validate and sanitize color values (hex, rgb, rgba)
 * Enhanced to prevent CSS injection attacks
 * 
 * @param string $color The color value to validate
 * @return string Sanitized color value or empty string if invalid
 */
function sliderberg_validate_color($color) {
    if (empty($color)) {
        return '';
    }
    
    // Remove any potentially dangerous characters first
    $color = preg_replace('/[^a-zA-Z0-9\#\(\)\,\.\s]/', '', $color);
    
    // Trim whitespace
    $color = trim($color);
    
    // Check for CSS injection attempts
    if (stripos($color, 'expression') !== false || 
        stripos($color, 'javascript') !== false || 
        stripos($color, 'script') !== false ||
        stripos($color, 'url') !== false ||
        stripos($color, 'import') !== false ||
        strpos($color, ';') !== false ||
        strpos($color, '}') !== false ||
        strpos($color, '{') !== false) {
        return '';
    }
    
    // Validate hex colors (3 or 6 digits)
    if (preg_match('/^#([0-9A-Fa-f]{3}){1,2}$/', $color)) {
        return strtolower($color);
    }
    
    // Validate rgb/rgba colors with strict pattern
    if (preg_match('/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0(?:\.\d{1,3})?|1(?:\.0{1,3})?)\s*)?\)$/i', $color, $matches)) {
        $r = intval($matches[1]);
        $g = intval($matches[2]);
        $b = intval($matches[3]);
        
        // Ensure RGB values are within valid range
        if ($r > 255 || $g > 255 || $b > 255) {
            return '';
        }
        
        if (isset($matches[4])) {
            $alpha = floatval($matches[4]);
            // Ensure alpha is within valid range
            if ($alpha < 0 || $alpha > 1) {
                return '';
            }
            return sprintf('rgba(%d, %d, %d, %.3f)', $r, $g, $b, $alpha);
        } else {
            return sprintf('rgb(%d, %d, %d)', $r, $g, $b);
        }
    }
    
    // Check against a whitelist of named colors (optional, more restrictive)
    $allowed_named_colors = array(
        'transparent', 'white', 'black', 'red', 'green', 'blue',
        'yellow', 'cyan', 'magenta', 'gray', 'grey'
    );
    
    if (in_array(strtolower($color), $allowed_named_colors, true)) {
        return strtolower($color);
    }
    
    return '';
}

/**
 * Validate numeric value within range
 * 
 * @param mixed $value The value to validate
 * @param int $min Minimum allowed value
 * @param int $max Maximum allowed value
 * @param int $default Default value if validation fails
 * @return int Validated integer
 */
function sliderberg_validate_numeric_range($value, $min, $max, $default) {
    $value = intval($value);
    
    if ($value < $min || $value > $max) {
        return $default;
    }
    
    return $value;
}

/**
 * Validate content position
 * 
 * @param string $position The position value
 * @return string Valid position or default
 */
function sliderberg_validate_position($position) {
    $valid_positions = array(
        'top-left', 'top-center', 'top-right',
        'center-left', 'center-center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right'
    );
    
    return in_array($position, $valid_positions, true) ? $position : 'center-center';
}

/**
 * Validate transition effect
 * 
 * @param string $effect The effect value
 * @return string Valid effect or default
 */
function sliderberg_validate_transition_effect($effect) {
    $valid_effects = array('slide', 'fade', 'zoom');
    return in_array($effect, $valid_effects, true) ? $effect : 'slide';
}

/**
 * Validate transition easing
 * 
 * @param string $easing The easing value
 * @return string Valid easing or default
 */
function sliderberg_validate_transition_easing($easing) {
    $valid_easings = array('ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear');
    return in_array($easing, $valid_easings, true) ? $easing : 'ease';
}

/**
 * Sanitize focal point value
 * 
 * @param array $focal_point The focal point array
 * @return array Sanitized focal point
 */
function sliderberg_sanitize_focal_point($focal_point) {
    $default = array('x' => 0.5, 'y' => 0.5);
    
    if (!is_array($focal_point)) {
        return $default;
    }
    
    return array(
        'x' => max(0, min(1, floatval($focal_point['x'] ?? 0.5))),
        'y' => max(0, min(1, floatval($focal_point['y'] ?? 0.5)))
    );
}

/**
 * Check if user can manage sliderberg
 * 
 * @return bool
 */
function sliderberg_user_can_manage() {
    return current_user_can('edit_posts');
}

/**
 * Get allowed plugins for installation
 * 
 * @return array
 */
function sliderberg_get_allowed_plugins() {
    return array(
        'ultimate-blocks',
        'wp-table-builder',
        'tableberg'
    );
}

/**
 * Validate plugin slug
 * 
 * @param string $plugin_slug The plugin slug to validate
 * @return bool
 */
function sliderberg_is_allowed_plugin($plugin_slug) {
    $allowed = sliderberg_get_allowed_plugins();
    return in_array($plugin_slug, $allowed, true);
}

/**
 * Validate file path is within plugin directory
 * 
 * @param string $file_path The file path to validate
 * @return bool
 */
function sliderberg_validate_file_path($file_path) {
    // Get real paths to prevent directory traversal
    $real_file_path = realpath($file_path);
    $real_plugin_dir = realpath(SLIDERBERG_PLUGIN_DIR);
    
    // Check if file exists and is within plugin directory
    if (!$real_file_path || !$real_plugin_dir) {
        return false;
    }
    
    // Ensure file is within plugin directory
    if (strpos($real_file_path, $real_plugin_dir) !== 0) {
        return false;
    }
    
    // Additional check for specific file extensions
    $allowed_extensions = array('.php', '.css', '.js', '.json');
    $file_extension = strtolower(substr($real_file_path, strrpos($real_file_path, '.')));
    
    if (!in_array($file_extension, $allowed_extensions, true)) {
        return false;
    }
    
    return true;
}

/**
 * Secure include function
 * 
 * @param string $file_path The file to include
 * @return bool
 */
function sliderberg_secure_include($file_path) {
    if (!sliderberg_validate_file_path($file_path)) {
        return false;
    }
    
    include $file_path;
    return true;
}