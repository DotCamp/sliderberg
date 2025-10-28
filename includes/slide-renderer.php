<?php
/**
 * PHP renderer for slide block
 * File: includes/slide-renderer.php
 */

function render_sliderberg_slide_block($attributes, $content, $block) {
    // Set defaults and sanitize
    $background_type = sanitize_text_field($attributes['backgroundType'] ?? 'color');
    $background_image = $attributes['backgroundImage'] ?? null;
    
    // Enhanced color validation - support hex, rgb, rgba
    $background_color = '';
    if (!empty($attributes['backgroundColor'])) {
        if (preg_match('/^#([0-9A-Fa-f]{3}){1,2}$/', $attributes['backgroundColor'])) {
            $background_color = $attributes['backgroundColor'];
        } elseif (preg_match('/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*)?\)$/', $attributes['backgroundColor'], $matches)) {
            $r = intval($matches[1]);
            $g = intval($matches[2]);
            $b = intval($matches[3]);
            if ($r <= 255 && $g <= 255 && $b <= 255) {
                $background_color = $attributes['backgroundColor'];
            }
        }
    }
    
    // Gradient validation
    $background_gradient = '';
    if (!empty($attributes['backgroundGradient'])) {
        $gradient = $attributes['backgroundGradient'];
        // Remove any potential script injections
        $gradient = preg_replace('/<script[^>]*>.*?<\/script>/i', '', $gradient);
        $gradient = str_ireplace('javascript:', '', $gradient);
        $gradient = trim($gradient);
        
        // Validate gradient syntax
        if (preg_match('/^(linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient|repeating-radial-gradient)\s*\(/i', $gradient)) {
            // Check for balanced parentheses
            $open_count = substr_count($gradient, '(');
            $close_count = substr_count($gradient, ')');
            if ($open_count === $close_count && $open_count > 0) {
                // Additional safety check for valid CSS color values
                if (preg_match('/(#[0-9A-Fa-f]{3,8}|rgb|rgba|hsl|hsla|transparent|currentColor|[a-z]+)/i', $gradient)) {
                    $background_gradient = $gradient;
                }
            }
        }
    }
    
    $focal_point = $attributes['focalPoint'] ?? ['x' => 0.5, 'y' => 0.5];
    
    // Enhanced overlay color validation
    $overlay_color = '#000000';
    if (!empty($attributes['overlayColor'])) {
        if (preg_match('/^#([0-9A-Fa-f]{3}){1,2}$/', $attributes['overlayColor'])) {
            $overlay_color = $attributes['overlayColor'];
        } elseif (preg_match('/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*)?\)$/', $attributes['overlayColor'], $matches)) {
            $r = intval($matches[1]);
            $g = intval($matches[2]);
            $b = intval($matches[3]);
            if ($r <= 255 && $g <= 255 && $b <= 255) {
                $overlay_color = $attributes['overlayColor'];
            }
        }
    }
    
    $overlay_opacity = floatval($attributes['overlayOpacity'] ?? 0);
    $min_height = max(100, min(1000, intval($attributes['minHeight'] ?? 400)));
    $content_position = sanitize_text_field($attributes['contentPosition'] ?? 'center-center');
    $is_fixed = (bool)($attributes['isFixed'] ?? false);
    
    // Border and radius attributes
    $border_width = max(0, min(50, intval($attributes['borderWidth'] ?? 0)));
    $border_color = '#000000';
    if (!empty($attributes['borderColor'])) {
        if (preg_match('/^#([0-9A-Fa-f]{3}){1,2}$/', $attributes['borderColor'])) {
            $border_color = $attributes['borderColor'];
        } elseif (preg_match('/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*(0(?:\.\d+)?|1(?:\.0+)?)\s*)?\)$/', $attributes['borderColor'], $matches)) {
            $r = intval($matches[1]);
            $g = intval($matches[2]);
            $b = intval($matches[3]);
            if ($r <= 255 && $g <= 255 && $b <= 255) {
                $border_color = $attributes['borderColor'];
            }
        }
    }
    
    $border_style = sanitize_text_field($attributes['borderStyle'] ?? 'solid');
    $valid_border_styles = ['solid', 'dashed', 'dotted', 'double'];
    if (!in_array($border_style, $valid_border_styles)) {
        $border_style = 'solid';
    }
    
    $border_radius = max(0, min(100, intval($attributes['borderRadius'] ?? 0)));
    
    // Validate content position
    $valid_positions = [
        'top-left', 'top-center', 'top-right',
        'center-left', 'center-center', 'center-right', 
        'bottom-left', 'bottom-center', 'bottom-right'
    ];
    if (!in_array($content_position, $valid_positions)) {
        $content_position = 'center-center';
    }
    
    // Build classes
    $classes = [
        'sliderberg-slide',
        'sliderberg-content-position-' . $content_position
    ];
    
    // Add border class if slide has borders
    if ($border_width > 0) {
        $classes[] = 'has-border';
    }
    
    // Build styles
    $styles = ['min-height: ' . $min_height . 'px'];
    
    // Add border styles
    if ($border_width > 0) {
        $styles[] = 'border-width: ' . $border_width . 'px';
        $styles[] = 'border-color: ' . esc_attr($border_color);
        $styles[] = 'border-style: ' . esc_attr($border_style);
    }
    
    // Add border radius
    if ($border_radius > 0) {
        $styles[] = 'border-radius: ' . $border_radius . 'px';
    }
    
    if ($background_type === 'color' && $background_color) {
        $styles[] = 'background-color: ' . esc_attr($background_color);
    } elseif ($background_type === 'gradient' && $background_gradient) {
        $styles[] = 'background-image: ' . esc_attr($background_gradient);
    } elseif ($background_type === 'image' && $background_image && !empty($background_image['url'])) {
        // Validate image URL
        $image_url = esc_url($background_image['url']);
        if (!empty($image_url)) {
            $styles[] = 'background-image: url(' . $image_url . ')';
            // Validate and sanitize focal point values
            $focal_x = max(0, min(1, floatval($focal_point['x'] ?? 0.5))) * 100;
            $focal_y = max(0, min(1, floatval($focal_point['y'] ?? 0.5))) * 100;
            $styles[] = 'background-position: ' . esc_attr($focal_x) . '% ' . esc_attr($focal_y) . '%';
            $styles[] = 'background-size: cover';
            $styles[] = 'background-attachment: ' . ($is_fixed ? 'fixed' : 'scroll');
        }
    }
    
    // Process inner blocks content
    $inner_content = '';
    if ($block instanceof WP_Block && !empty($block->inner_blocks)) {
        foreach ($block->inner_blocks as $inner_block) {
            $inner_content .= $inner_block->render();
        }
    } else {
        // Fallback to $content parameter
        $inner_content = $content;
    }
    
    // Prepare template variables
    $class_string = esc_attr(implode(' ', $classes));
    $style_string = esc_attr(implode('; ', $styles));
    $has_overlay = $overlay_opacity > 0;
    $content = $inner_content; // Use processed content
    // Centralized sanitization: allow embeds via allowed HTML
    $content = wp_kses($content, sliderberg_get_allowed_html());
    
    // Render template
    ob_start();
    include __DIR__ . '/templates/slide-block.php';
    return ob_get_clean();
}

/**
 * Register the block with PHP rendering
 */
function sliderberg_register_slide_block() {
    register_block_type('sliderberg/slide', [
        'render_callback' => 'render_sliderberg_slide_block',
    ]);
}
