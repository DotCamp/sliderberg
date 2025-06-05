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
 * $content - Inner blocks content
 */

// Security check
if (!defined('ABSPATH')) {
    exit;
}
?>

<div<?php echo $wrapper_attr_string; ?>>
    <?php if ($navigation_type === 'top'): ?>
        <div class="sliderberg-navigation-bar sliderberg-navigation-bar-top">
            <div class="sliderberg-nav-controls sliderberg-nav-controls-grouped">
                <?php echo render_nav_button('prev', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php echo render_slide_indicators($hide_dots); ?>
                <?php echo render_nav_button('next', $nav_button_styles, $navigation_shape, $navigation_size); ?>
            </div>
        </div>
    <?php endif; ?>
    
    <div class="sliderberg-container">
        <div class="sliderberg-slides">
            <div class="sliderberg-slides-container"<?php echo $container_attr_string; ?>>
                <?php echo $content; ?>
            </div>
            
            <?php if ($navigation_type === 'split'): ?>
                <div class="sliderberg-navigation" 
                     data-type="<?php echo esc_attr($navigation_type); ?>"
                     data-placement="<?php echo esc_attr($navigation_placement); ?>"
                     style="opacity: <?php echo esc_attr($navigation_opacity); ?>;">
                    <div class="sliderberg-nav-controls">
                        <?php 
                        $prev_styles = array_merge($nav_button_styles, $split_nav_styles, [
                            'left' => $navigation_horizontal_pos . 'px'
                        ]);
                        echo render_nav_button('prev', $prev_styles, $navigation_shape, $navigation_size);
                        
                        $next_styles = array_merge($nav_button_styles, $split_nav_styles, [
                            'right' => $navigation_horizontal_pos . 'px'
                        ]);
                        echo render_nav_button('next', $next_styles, $navigation_shape, $navigation_size);
                        ?>
                    </div>
                </div>
                <?php echo render_slide_indicators($hide_dots); ?>
            <?php endif; ?>
        </div>
    </div>
    
    <?php if ($navigation_type === 'bottom'): ?>
        <div class="sliderberg-navigation-bar sliderberg-navigation-bar-bottom">
            <div class="sliderberg-nav-controls sliderberg-nav-controls-grouped">
                <?php echo render_nav_button('prev', $nav_button_styles, $navigation_shape, $navigation_size); ?>
                <?php echo render_slide_indicators($hide_dots); ?>
                <?php echo render_nav_button('next', $nav_button_styles, $navigation_shape, $navigation_size); ?>
            </div>
        </div>
    <?php endif; ?>
</div>