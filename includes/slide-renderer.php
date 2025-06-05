<?php
/**
 * PHP renderer for slide block
 * File: includes/slide-renderer.php
 */

function render_sliderberg_slide_block($attributes, $content, $block) {
    // Set defaults and sanitize
    $background_type = sanitize_text_field($attributes['backgroundType'] ?? '');
    $background_image = $attributes['backgroundImage'] ?? null;
    $background_color = sanitize_hex_color($attributes['backgroundColor'] ?? '');
    $focal_point = $attributes['focalPoint'] ?? ['x' => 0.5, 'y' => 0.5];
    $overlay_color = sanitize_hex_color($attributes['overlayColor'] ?? '#000000');
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
        $styles[] = 'background-color: ' . $background_color;
    } elseif ($background_type === 'image' && $background_image && !empty($background_image['url'])) {
        $styles[] = 'background-image: url(' . esc_url($background_image['url']) . ')';
        $styles[] = 'background-position: ' . (floatval($focal_point['x']) * 100) . '% ' . (floatval($focal_point['y']) * 100) . '%';
        $styles[] = 'background-size: cover';
        $styles[] = 'background-attachment: ' . ($is_fixed ? 'fixed' : 'scroll');
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