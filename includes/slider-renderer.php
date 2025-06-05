<?php
/**
 * PHP renderer for SliderBerg main block
 * File: includes/slider-renderer.php
 */

function render_sliderberg_slider_block($attributes, $content, $block) {
    // Set defaults and sanitize attributes
    $type = sanitize_text_field($attributes['type'] ?? '');
    $navigation_type = sanitize_text_field($attributes['navigationType'] ?? 'bottom');
    $navigation_placement = sanitize_text_field($attributes['navigationPlacement'] ?? 'overlay');
    $navigation_shape = sanitize_text_field($attributes['navigationShape'] ?? 'circle');
    $navigation_size = sanitize_text_field($attributes['navigationSize'] ?? 'medium');
    $navigation_color = sanitize_hex_color($attributes['navigationColor'] ?? '#ffffff');
    $navigation_bg_color = sanitize_text_field($attributes['navigationBgColor'] ?? 'rgba(0, 0, 0, 0.5)');
    $navigation_opacity = floatval($attributes['navigationOpacity'] ?? 1);
    $navigation_vertical_pos = intval($attributes['navigationVerticalPosition'] ?? 20);
    $navigation_horizontal_pos = intval($attributes['navigationHorizontalPosition'] ?? 20);
    $dot_color = sanitize_text_field($attributes['dotColor'] ?? '#6c757d');
    $dot_active_color = sanitize_text_field($attributes['dotActiveColor'] ?? '#ffffff');
    $hide_dots = (bool)($attributes['hideDots'] ?? false);
    $transition_effect = sanitize_text_field($attributes['transitionEffect'] ?? 'slide');
    $transition_duration = intval($attributes['transitionDuration'] ?? 500);
    $transition_easing = sanitize_text_field($attributes['transitionEasing'] ?? 'ease');
    $autoplay = (bool)($attributes['autoplay'] ?? false);
    $autoplay_speed = intval($attributes['autoplaySpeed'] ?? 5000);
    $pause_on_hover = (bool)($attributes['pauseOnHover'] ?? true);
    $width_preset = sanitize_text_field($attributes['widthPreset'] ?? 'full');
    $custom_width = sanitize_text_field($attributes['customWidth'] ?? '');
    $align = sanitize_text_field($attributes['align'] ?? '');
    
    // Validate transition effect
    $valid_effects = ['slide', 'fade', 'zoom'];
    if (!in_array($transition_effect, $valid_effects)) {
        $transition_effect = 'slide';
    }
    
    // Validate navigation type
    $valid_nav_types = ['split', 'top', 'bottom'];
    if (!in_array($navigation_type, $valid_nav_types)) {
        $navigation_type = 'bottom';
    }
    
    // Build CSS custom properties
    $css_vars = [
        '--sliderberg-dot-color' => $dot_color,
        '--sliderberg-dot-active-color' => $dot_active_color,
    ];
    
    // Add custom width if specified
    if ($width_preset === 'custom' && $custom_width) {
        $css_vars['--sliderberg-custom-width'] = $custom_width . 'px';
    }
    
    // Build wrapper attributes
    $wrapper_classes = ['wp-block-sliderberg-sliderberg'];
    if ($align) {
        $wrapper_classes[] = 'align' . $align;
    }
    
    $wrapper_attrs = [
        'class' => implode(' ', $wrapper_classes),
        'data-width-preset' => $width_preset,
        'style' => build_css_vars_string($css_vars)
    ];
    
    // Build slides container data attributes for frontend JS
    $container_attrs = [
        'data-transition-effect' => $transition_effect,
        'data-transition-duration' => $transition_duration,
        'data-transition-easing' => $transition_easing,
        'data-autoplay' => $autoplay ? 'true' : 'false',
        'data-autoplay-speed' => $autoplay_speed,
        'data-pause-on-hover' => $pause_on_hover ? 'true' : 'false'
    ];
    
    // Navigation button styles
    $nav_button_styles = [
        'color' => $navigation_color,
        'background-color' => $navigation_bg_color
    ];
    
    // Split navigation positioning
    $split_nav_styles = [];
    if ($navigation_type === 'split') {
        $split_nav_styles = [
            'transform' => "translateY(calc(-50% + {$navigation_vertical_pos}px))"
        ];
    }
    
    // Prepare variables for template
    $template_vars = [
        'wrapper_attrs' => $wrapper_attrs,
        'container_attrs' => $container_attrs,
        'navigation_type' => $navigation_type,
        'navigation_placement' => $navigation_placement,
        'navigation_opacity' => $navigation_opacity,
        'navigation_shape' => $navigation_shape,
        'navigation_size' => $navigation_size,
        'nav_button_styles' => $nav_button_styles,
        'split_nav_styles' => $split_nav_styles,
        'navigation_horizontal_pos' => $navigation_horizontal_pos,
        'hide_dots' => $hide_dots,
        'content' => $content // Inner blocks content
    ];
    
    // Render template
    ob_start();
    sliderberg_render_slider_template($template_vars);
    return ob_get_clean();
}

/**
 * Build CSS variables string from array
 */
function build_css_vars_string($vars) {
    $styles = [];
    foreach ($vars as $property => $value) {
        if ($value) {
            $styles[] = $property . ': ' . esc_attr($value);
        }
    }
    return implode('; ', $styles);
}

/**
 * Render navigation button
 */
function render_nav_button($type, $styles, $shape, $size, $additional_styles = []) {
    $all_styles = array_merge($styles, $additional_styles);
    $style_string = build_inline_styles($all_styles);
    
    $icon = $type === 'prev' 
        ? '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z"/></svg>'
        : '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z"/></svg>';
    
    $label = $type === 'prev' ? 'Previous Slide' : 'Next Slide';
    
    return sprintf(
        '<button class="sliderberg-nav-button sliderberg-%s" aria-label="%s" data-shape="%s" data-size="%s" style="%s">%s</button>',
        esc_attr($type),
        esc_attr($label),
        esc_attr($shape),
        esc_attr($size),
        esc_attr($style_string),
        $icon
    );
}

/**
 * Build inline styles string
 */
function build_inline_styles($styles) {
    $style_parts = [];
    foreach ($styles as $property => $value) {
        if ($value) {
            $style_parts[] = $property . ': ' . $value;
        }
    }
    return implode('; ', $style_parts);
}

/**
 * Render slider indicators
 */
function render_slide_indicators($hide_dots) {
    if ($hide_dots) {
        return '';
    }
    return '<div class="sliderberg-slide-indicators"><!-- Indicators populated by JS --></div>';
}

/**
 * Render the slider template
 */
function sliderberg_render_slider_template($vars) {
    extract($vars);
    
    // Build wrapper attributes string
    $wrapper_attr_string = '';
    foreach ($wrapper_attrs as $attr => $value) {
        $wrapper_attr_string .= sprintf(' %s="%s"', $attr, esc_attr($value));
    }
    
    // Build container attributes string
    $container_attr_string = '';
    foreach ($container_attrs as $attr => $value) {
        $container_attr_string .= sprintf(' %s="%s"', $attr, esc_attr($value));
    }
    
    include __DIR__ . '/templates/slider-block.php';
}

/**
 * Register the slider block with PHP rendering
 */
function sliderberg_register_slider_block() {
    register_block_type('sliderberg/sliderberg', [
        'render_callback' => 'render_sliderberg_slider_block',
        'editor_script' => 'sliderberg-editor',
        'editor_style' => 'sliderberg-editor',
        'style' => 'sliderberg-style',
        'supports' => [
            'html' => false,
            'align' => ['wide', 'full'],
            'alignWide' => true,
            'fullWidth' => true
        ],
        'attributes' => [
            'align' => [
                'type' => 'string',
                'default' => 'full'
            ],
            'type' => [
                'type' => 'string',
                'default' => ''
            ],
            'autoplay' => [
                'type' => 'boolean',
                'default' => false
            ],
            'autoplaySpeed' => [
                'type' => 'number',
                'default' => 5000
            ],
            'pauseOnHover' => [
                'type' => 'boolean',
                'default' => true
            ],
            'transitionEffect' => [
                'type' => 'string',
                'default' => 'slide'
            ],
            'transitionDuration' => [
                'type' => 'number',
                'default' => 500
            ],
            'transitionEasing' => [
                'type' => 'string',
                'default' => 'ease'
            ],
            'navigationType' => [
                'type' => 'string',
                'default' => 'bottom'
            ],
            'navigationPlacement' => [
                'type' => 'string',
                'default' => 'overlay'
            ],
            'navigationShape' => [
                'type' => 'string',
                'default' => 'circle'
            ],
            'navigationSize' => [
                'type' => 'string',
                'default' => 'medium'
            ],
            'navigationColor' => [
                'type' => 'string',
                'default' => '#ffffff'
            ],
            'navigationBgColor' => [
                'type' => 'string',
                'default' => 'rgba(0, 0, 0, 0.5)'
            ],
            'navigationOpacity' => [
                'type' => 'number',
                'default' => 1
            ],
            'navigationVerticalPosition' => [
                'type' => 'number',
                'default' => 20
            ],
            'navigationHorizontalPosition' => [
                'type' => 'number',
                'default' => 20
            ],
            'dotColor' => [
                'type' => 'string',
                'default' => '#6c757d'
            ],
            'dotActiveColor' => [
                'type' => 'string',
                'default' => '#ffffff'
            ],
            'hideDots' => [
                'type' => 'boolean',
                'default' => false
            ],
            'widthPreset' => [
                'type' => 'string',
                'default' => 'full'
            ],
            'customWidth' => [
                'type' => 'string',
                'default' => ''
            ],
            'widthUnit' => [
                'type' => 'string',
                'default' => 'px'
            ]
        ]
    ]);
}