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
    
    // Render template with security check
    ob_start();
    $template_file = __DIR__ . '/templates/slide-block.php';
    
    // Prevent TOCTOU race condition by using file handle
    $real_template_path = realpath($template_file);
    $real_plugin_dir = realpath(SLIDERBERG_PLUGIN_DIR);
    
    // Validate path first
    if (!$real_template_path || !$real_plugin_dir || strpos($real_template_path, $real_plugin_dir) !== 0) {
        return '<!-- Template file not found or invalid -->';
    }
    
    // Use file locking to prevent race conditions
    $fp = @fopen($real_template_path, 'r');
    if (!$fp) {
        return '<!-- Template file could not be opened -->';
    }
    
    // Lock file for reading
    if (!flock($fp, LOCK_SH)) {
        fclose($fp);
        return '<!-- Template file is locked -->';
    }
    
    // Verify file is still within bounds after locking
    $locked_real_path = realpath(stream_get_meta_data($fp)['uri']);
    if (!$locked_real_path || strpos($locked_real_path, $real_plugin_dir) !== 0) {
        flock($fp, LOCK_UN);
        fclose($fp);
        return '<!-- Template security check failed -->';
    }
    
    // Include file using the validated path
    flock($fp, LOCK_UN);
    fclose($fp);
    
    // Use include with full path to prevent manipulation
    include $real_template_path;
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