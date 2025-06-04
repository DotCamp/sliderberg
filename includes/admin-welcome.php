<?php
/**
 * SliderBerg Admin Welcome Page
 * Add this to your main plugin file (sliderberg.php) or create a separate admin file
 */

// Add admin menu
function sliderberg_admin_menu() {
    add_menu_page(
        __('SliderBerg', 'sliderberg'),           // Page title
        __('SliderBerg', 'sliderberg'),           // Menu title
        'manage_options',                          // Capability
        'sliderberg-welcome',                     // Menu slug
        'sliderberg_welcome_page',                // Callback function
        SLIDERBERG_PLUGIN_URL . 'assets/images/logo-icon.svg', // Icon
        30                                        // Position
    );
    
    // Add submenu item for welcome page
    add_submenu_page(
        'sliderberg-welcome',                     // Parent slug
        __('Welcome', 'sliderberg'),              // Page title
        __('Welcome', 'sliderberg'),              // Menu title
        'manage_options',                         // Capability
        'sliderberg-welcome',                     // Menu slug
        'sliderberg_welcome_page'                 // Callback function
    );
}
add_action('admin_menu', 'sliderberg_admin_menu');

// Enqueue admin styles
function sliderberg_admin_styles($hook) {
    if (strpos($hook, 'sliderberg-welcome') !== false) {
        wp_enqueue_style(
            'sliderberg-admin-welcome',
            SLIDERBERG_PLUGIN_URL . 'assets/css/admin-welcome.css',
            array(),
            SLIDERBERG_VERSION
        );
    }
}
add_action('admin_enqueue_scripts', 'sliderberg_admin_styles');

// Redirect to welcome page on activation
function sliderberg_activation_redirect() {
    if (get_option('sliderberg_activation_redirect', false)) {
        delete_option('sliderberg_activation_redirect');
        if (!isset($_GET['activate-multi'])) {
            wp_redirect(admin_url('admin.php?page=sliderberg-welcome'));
            exit;
        }
    }
}
add_action('admin_init', 'sliderberg_activation_redirect');

// Set redirect flag on activation
function sliderberg_set_activation_redirect() {
    add_option('sliderberg_activation_redirect', true);
}
register_activation_hook(__FILE__, 'sliderberg_set_activation_redirect');

// Welcome page content
function sliderberg_welcome_page() {
    ?>
    <div class="sliderberg-welcome-wrap">
        <div class="sliderberg-welcome-header">
            <div class="sliderberg-welcome-header-content">
                <div class="sliderberg-welcome-intro">
                    <h1><?php _e('Welcome to SliderBerg!', 'sliderberg'); ?></h1>
                    <p class="sliderberg-welcome-subtitle">
                        <?php _e('Create beautiful, responsive sliders with ease using the WordPress block editor.', 'sliderberg'); ?>
                    </p>
                </div>
                <div class="sliderberg-welcome-version">
                    <?php printf(__('Version %s', 'sliderberg'), SLIDERBERG_VERSION); ?>
                </div>
            </div>
        </div>

        <div class="sliderberg-welcome-content">
            <div class="sliderberg-welcome-main">
                
                <!-- Getting Started Section -->
                <div class="sliderberg-welcome-section">
                    <div class="sliderberg-section-header">
                        <h2><?php _e('🚀 Getting Started', 'sliderberg'); ?></h2>
                        <p><?php _e('Follow these simple steps to create your first slider', 'sliderberg'); ?></p>
                    </div>
                    
                    <div class="sliderberg-steps-grid">
                        <div class="sliderberg-step">
                            <div class="sliderberg-step-number">1</div>
                            <div class="sliderberg-step-content">
                                <h3><?php _e('Add SliderBerg Block', 'sliderberg'); ?></h3>
                                <p><?php _e('In any post or page, click the + button and search for "SliderBerg" to add the block.', 'sliderberg'); ?></p>
                                <div class="sliderberg-screenshot-placeholder">
                                    <img src="<?php echo SLIDERBERG_PLUGIN_URL; ?>assets/images/screenshots/step-1-add-block.png" alt="<?php _e('Add SliderBerg Block', 'sliderberg'); ?>" />
                                </div>
                            </div>
                        </div>
                        
                        <div class="sliderberg-step">
                            <div class="sliderberg-step-number">2</div>
                            <div class="sliderberg-step-content">
                                <h3><?php _e('Choose Slider Type', 'sliderberg'); ?></h3>
                                <p><?php _e('Select "Blocks Slider" to create a custom content slider with unlimited possibilities.', 'sliderberg'); ?></p>
                                <div class="sliderberg-screenshot-placeholder">
                                    <img src="<?php echo SLIDERBERG_PLUGIN_URL; ?>assets/images/screenshots/step-2-choose-type.png" alt="<?php _e('Choose Slider Type', 'sliderberg'); ?>" />
                                </div>
                            </div>
                        </div>
                        
                        <div class="sliderberg-step">
                            <div class="sliderberg-step-number">3</div>
                            <div class="sliderberg-step-content">
                                <h3><?php _e('Customize Your Slides', 'sliderberg'); ?></h3>
                                <p><?php _e('Add content, images, and customize the background. Each slide can contain any WordPress blocks.', 'sliderberg'); ?></p>
                                <div class="sliderberg-screenshot-placeholder">
                                    <img src="<?php echo SLIDERBERG_PLUGIN_URL; ?>assets/images/screenshots/step-3-customize.png" alt="<?php _e('Customize Slides', 'sliderberg'); ?>" />
                                </div>
                            </div>
                        </div>
                        
                        <div class="sliderberg-step">
                            <div class="sliderberg-step-number">4</div>
                            <div class="sliderberg-step-content">
                                <h3><?php _e('Configure Settings', 'sliderberg'); ?></h3>
                                <p><?php _e('Use the block settings panel to customize transitions, autoplay, navigation, and more.', 'sliderberg'); ?></p>
                                <div class="sliderberg-screenshot-placeholder">
                                    <img src="<?php echo SLIDERBERG_PLUGIN_URL; ?>assets/images/screenshots/step-4-settings.png" alt="<?php _e('Configure Settings', 'sliderberg'); ?>" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Features Section -->
                <div class="sliderberg-welcome-section">
                    <div class="sliderberg-section-header">
                        <h2><?php _e('✨ Key Features', 'sliderberg'); ?></h2>
                        <p><?php _e('Everything you need to create stunning sliders', 'sliderberg'); ?></p>
                    </div>
                    
                    <div class="sliderberg-features-grid">
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">🎨</div>
                            <h4><?php _e('Beautiful Transitions', 'sliderberg'); ?></h4>
                            <p><?php _e('Choose from slide, fade, or zoom effects with customizable duration and easing.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">📱</div>
                            <h4><?php _e('Mobile Responsive', 'sliderberg'); ?></h4>
                            <p><?php _e('Touch-enabled with swipe gestures. Looks perfect on all devices.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">⚡</div>
                            <h4><?php _e('Performance Optimized', 'sliderberg'); ?></h4>
                            <p><?php _e('Lightweight and fast. Built with modern web standards for smooth performance.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">♿</div>
                            <h4><?php _e('Accessibility Ready', 'sliderberg'); ?></h4>
                            <p><?php _e('Keyboard navigation, ARIA labels, and screen reader support built-in.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">🎯</div>
                            <h4><?php _e('Easy to Use', 'sliderberg'); ?></h4>
                            <p><?php _e('Intuitive block interface. No coding required. Works with any WordPress theme.', 'sliderberg'); ?></p>
                        </div>
                        
                        <div class="sliderberg-feature">
                            <div class="sliderberg-feature-icon">🔧</div>
                            <h4><?php _e('Highly Customizable', 'sliderberg'); ?></h4>
                            <p><?php _e('Control every aspect: navigation style, autoplay, colors, and positioning.', 'sliderberg'); ?></p>
                        </div>
                    </div>
                </div>

                <!-- Tips Section -->
                <div class="sliderberg-welcome-section">
                    <div class="sliderberg-section-header">
                        <h2><?php _e('💡 Pro Tips', 'sliderberg'); ?></h2>
                        <p><?php _e('Get the most out of SliderBerg with these helpful tips', 'sliderberg'); ?></p>
                    </div>
                    
                    <div class="sliderberg-tips-grid">
                        <div class="sliderberg-tip">
                            <div class="sliderberg-tip-icon">🖼️</div>
                            <div class="sliderberg-tip-content">
                                <h4><?php _e('Image Optimization', 'sliderberg'); ?></h4>
                                <p><?php _e('Use optimized images (WebP format when possible) for faster loading times. Recommended size: 1920×1080px.', 'sliderberg'); ?></p>
                            </div>
                        </div>
                        
                        <div class="sliderberg-tip">
                            <div class="sliderberg-tip-icon">⏱️</div>
                            <div class="sliderberg-tip-content">
                                <h4><?php _e('Autoplay Best Practices', 'sliderberg'); ?></h4>
                                <p><?php _e('Keep autoplay speed between 3-7 seconds. Enable "Pause on Hover" for better user experience.', 'sliderberg'); ?></p>
                            </div>
                        </div>
                        
                        <div class="sliderberg-tip">
                            <div class="sliderberg-tip-icon">📐</div>
                            <div class="sliderberg-tip-content">
                                <h4><?php _e('Content Positioning', 'sliderberg'); ?></h4>
                                <p><?php _e('Use focal points for background images and experiment with different content positions for visual impact.', 'sliderberg'); ?></p>
                            </div>
                        </div>
                        
                        <div class="sliderberg-tip">
                            <div class="sliderberg-tip-icon">🎯</div>
                            <div class="sliderberg-tip-content">
                                <h4><?php _e('Call-to-Action', 'sliderberg'); ?></h4>
                                <p><?php _e('Add button blocks to your slides for clear calls-to-action. Use contrasting colors for better visibility.', 'sliderberg'); ?></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar -->
            <div class="sliderberg-welcome-sidebar">
                
                <!-- Quick Links -->
                <div class="sliderberg-sidebar-section">
                    <h3><?php _e('Quick Links', 'sliderberg'); ?></h3>
                    <ul class="sliderberg-quick-links">
                        <li><a href="<?php echo admin_url('post-new.php?post_type=page'); ?>" class="sliderberg-link"><?php _e('Create New Page', 'sliderberg'); ?></a></li>
                        <li><a href="https://sliderberg.com/docs/" target="_blank" class="sliderberg-link"><?php _e('Documentation', 'sliderberg'); ?></a></li>
                        <li><a href="https://wordpress.org/support/plugin/sliderberg/" target="_blank" class="sliderberg-link"><?php _e('Get Support', 'sliderberg'); ?></a></li>
                        <li><a href="https://wordpress.org/support/plugin/sliderberg/reviews/" target="_blank" class="sliderberg-link"><?php _e('Leave us a review', 'sliderberg'); ?></a></li>
                    </ul>
                </div>


                <!-- Support -->
                <div class="sliderberg-sidebar-section">
                    <h3><?php _e('Need Help?', 'sliderberg'); ?></h3>
                    <p><?php _e('We\'re here to help you succeed with SliderBerg.', 'sliderberg'); ?></p>
                    <a href="https://wordpress.org/support/plugin/sliderberg/" target="_blank" class="sliderberg-support-button">
                        <?php _e('Contact Support', 'sliderberg'); ?>
                    </a>
                </div>

            </div>
        </div>

        <!-- Footer -->
        <div class="sliderberg-welcome-footer">
            <p>
                <?php printf(
                    __('Made with ❤️ by %s', 'sliderberg'),
                    '<a href="https://dotcamp.com" target="_blank">DotCamp</a>'
                ); ?>
            </p>
        </div>
    </div>
    <?php
}