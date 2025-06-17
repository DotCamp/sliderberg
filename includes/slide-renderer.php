<?php
/**
 * PHP renderer for slide block
 * File: includes/slide-renderer.php
 */

function render_sliderberg_slide_block($attributes, $content, $block) {
    // Set defaults and sanitize
    $background_type = sanitize_text_field($attributes['backgroundType'] ?? '');
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
    
    // Build styles
    $styles = ['min-height: ' . $min_height . 'px'];
    
    if ($background_type === 'color' && $background_color) {
        $styles[] = 'background-color: ' . esc_attr($background_color);
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
    } else {
        $styles[] = 'background-color: transparent';
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
    
    // Render template with security check
    ob_start();
    $template_file = __DIR__ . '/templates/slide-block.php';
    
    // Validate template file exists and is within plugin directory
    if (!file_exists($template_file) || strpos(realpath($template_file), realpath(SLIDERBERG_PLUGIN_DIR)) !== 0) {
        return '<!-- Template file not found or invalid -->';
    }
    
    include $template_file;
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