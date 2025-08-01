<?php
/**
 * Updated Slide block template with proper positioning
 * File: includes/templates/slide-block.php
 * 
 * Available variables:
 * $class_string - Escaped CSS classes
 * $style_string - Escaped inline styles
 * $has_overlay - Boolean for overlay
 * $overlay_color - Sanitized overlay color
 * $overlay_opacity - Float overlay opacity
 * $content - Inner blocks content (pre-rendered by WordPress)
 */

// Security check - ensure this file is not accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="<?php echo $class_string; ?>" style="<?php echo $style_string; ?>">
    <?php if ($has_overlay): ?>
        <div class="sliderberg-overlay" 
             style="background-color: <?php echo esc_attr($overlay_color); ?>; opacity: <?php echo esc_attr($overlay_opacity); ?>;"></div>
    <?php endif; ?>
    
    <div class="sliderberg-slide-content">
        <?php echo wp_kses_post($content); ?>
    </div>
</div>
