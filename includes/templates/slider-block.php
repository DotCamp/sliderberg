<?php
/**
 * SliderBerg main block template
 * File: templates/slider-block.php
 * 
 * Available variables from sliderberg_render_slider_template():
 * $wrapper_attr_string - Escaped wrapper attributes
 * $container_attr_string - Escaped container attributes
 * $navigation_type - Navigation type (split, top, bottom)
 * $navigation_placement - Navigation placement (overlay, outside)
 * $navigation_opacity - Navigation opacity
 * $navigation_shape - Navigation shape (circle, square)
 * $navigation_size - Navigation size (small, medium, large)
 * $nav_button_styles - Array of button styles
 * $split_nav_styles - Array of split navigation styles
 * $navigation_horizontal_pos - Horizontal position for split nav
 * $hide_dots - Boolean for hiding dots
 * $hide_navigation - Boolean for hiding navigation arrows
 * $content - Inner blocks content
 */

// Security check
if (!defined('ABSPATH')) {
    exit;
}
?>

<div<?php echo $wrapper_attr_string; ?>>
    <?php if ($navigation_type === 'top'): ?>
        <div class="sliderberg-navigation-bar sliderberg-navigation-bar-top" style="opacity: <?php echo esc_attr($navigation_opacity); ?>;">
            <div class="sliderberg-nav-controls sliderberg-nav-controls-grouped">
                <?php if (!$hide_navigation): ?>
                    <?php echo render_nav_button('prev', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php endif; ?>
                <?php echo render_slide_indicators($hide_dots); ?>
                <?php if (!$hide_navigation): ?>
                    <?php echo render_nav_button('next', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php endif; ?>
            </div>
        </div>
    <?php endif; ?>
    
    <div class="sliderberg-container">
        <div class="sliderberg-slides">
            <div class="sliderberg-slides-container"<?php echo $container_attr_string; ?>>
                <?php echo wp_kses_post($content); ?>
            </div>
            
            <?php if ($navigation_type === 'split'): ?>
                <?php if ($navigation_placement === 'overlay'): ?>
                    <!-- Direct positioning mode: render buttons without overlay container to avoid blocking slide content -->
                    <?php if (!$hide_navigation): ?>
                        <?php 
                        // Defensive bounds checking for position values (security layer)
                        $safe_horizontal_pos = isset($navigation_horizontal_pos) ? max(0, min(200, intval($navigation_horizontal_pos))) : 20;
                        $safe_vertical_pos = isset($navigation_vertical_pos) ? max(-200, min(200, intval($navigation_vertical_pos))) : 20;
                        
                        // Use direct positioning with CSS custom properties (like React editor fix)
                        $prev_direct_styles = array_merge($nav_button_styles, [
                            '--sliderberg-nav-horizontal-position' => $safe_horizontal_pos . 'px',
                            '--sliderberg-nav-vertical-position' => $safe_vertical_pos . 'px'
                        ]);
                        echo render_nav_button('prev', $prev_direct_styles, $navigation_shape, $navigation_size, 'sliderberg-frontend-direct');
                        
                        $next_direct_styles = array_merge($nav_button_styles, [
                            '--sliderberg-nav-horizontal-position' => $safe_horizontal_pos . 'px',
                            '--sliderberg-nav-vertical-position' => $safe_vertical_pos . 'px'
                        ]);
                        echo render_nav_button('next', $next_direct_styles, $navigation_shape, $navigation_size, 'sliderberg-frontend-direct');
                        ?>
                    <?php endif; ?>
                    <?php echo render_slide_indicators($hide_dots); ?>
                <?php else: ?>
                    <!-- Standard overlay container mode (for non-overlay placement) -->
                    <div class="sliderberg-navigation" 
                         data-type="<?php echo esc_attr($navigation_type); ?>"
                         data-placement="<?php echo esc_attr($navigation_placement); ?>"
                         style="opacity: <?php echo esc_attr($navigation_opacity); ?>;">
                        <div class="sliderberg-nav-controls">
                            <?php if (!$hide_navigation): ?>
                                <?php 
                                $prev_styles = array_merge($nav_button_styles, $split_nav_styles, [
                                    'left' => intval($navigation_horizontal_pos) . 'px'
                                ]);
                                echo render_nav_button('prev', $prev_styles, $navigation_shape, $navigation_size);
                                
                                $next_styles = array_merge($nav_button_styles, $split_nav_styles, [
                                    'right' => intval($navigation_horizontal_pos) . 'px'
                                ]);
                                echo render_nav_button('next', $next_styles, $navigation_shape, $navigation_size);
                                ?>
                            <?php endif; ?>
                        </div>
                    </div>
                    <?php echo render_slide_indicators($hide_dots); ?>
                <?php endif; ?>
            <?php endif; ?>
        </div>
    </div>
    
    <?php if ($navigation_type === 'bottom'): ?>
        <div class="sliderberg-navigation-bar sliderberg-navigation-bar-bottom" style="opacity: <?php echo esc_attr($navigation_opacity); ?>;">
            <div class="sliderberg-nav-controls sliderberg-nav-controls-grouped">
                <?php if (!$hide_navigation): ?>
                    <?php echo render_nav_button('prev', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php endif; ?>
                <?php echo render_slide_indicators($hide_dots); ?>
                <?php if (!$hide_navigation): ?>
                    <?php echo render_nav_button('next', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php endif; ?>
            </div>
        </div>
    <?php endif; ?>
</div>