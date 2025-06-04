<?php
/**
 * Enhanced SliderBerg Admin Welcome Page with Create Post Action
 * Replace the content in includes/admin-welcome.php
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

// Handle the create post with slider action
function sliderberg_handle_create_post_action() {
    // Check if this is our action and verify nonce
    if (isset($_GET['action']) && $_GET['action'] === 'sliderberg_create_post' && 
        isset($_GET['_wpnonce']) && wp_verify_nonce($_GET['_wpnonce'], 'sliderberg_create_post')) {
        
        // Check user permissions
        if (!current_user_can('edit_posts')) {
            wp_die(__('You do not have permission to create posts.', 'sliderberg'));
        }

        // Create a new post with SliderBerg block using the exact format WordPress generates
        $post_content = '<!-- wp:sliderberg/sliderberg {"type":"blocks","navigationPlacement":"outside"} -->
<div style="--sliderberg-dot-color:#6c757d;--sliderberg-dot-active-color:#ffffff" data-width-preset="full" class="wp-block-sliderberg-sliderberg alignfull"><div class="sliderberg-container"><div class="sliderberg-slides"><div class="sliderberg-slides-container" data-transition-effect="slide" data-transition-duration="500" data-transition-easing="ease" data-autoplay="false" data-autoplay-speed="5000" data-pause-on-hover="true"><!-- wp:sliderberg/slide {"backgroundType":"color","backgroundColor":"#007cba"} -->
<div class="wp-block-sliderberg-slide sliderberg-slide sliderberg-content-position-center-center has-007-cba-background-color has-background" style="min-height:400px;background-color:#007cba;background-image:none;background-position:center;background-size:cover;background-attachment:scroll"><div class="sliderberg-overlay" style="background-color:#000000;opacity:0"></div><div class="sliderberg-slide-content"><!-- wp:heading {"textAlign":"center","textColor":"white"} -->
<h2 class="wp-block-heading has-white-color has-text-color has-text-align-center">Welcome to Your First Slide</h2>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","textColor":"white"} -->
<p class="has-text-align-center has-white-color has-text-color">Start customizing your slider by adding content, images, and more slides. Click on this slide to edit its background and content.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"white","textColor":"black","style":{"border":{"radius":"25px"}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-black-color has-white-background-color has-text-color has-background wp-element-button" style="border-radius:25px">Get Started</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:sliderberg/slide --></div></div></div><div class="sliderberg-navigation-bar sliderberg-navigation-bar-bottom"><div class="sliderberg-nav-controls sliderberg-nav-controls-grouped"><button class="sliderberg-nav-button sliderberg-prev" aria-label="Previous Slide" data-shape="circle" data-size="medium" style="color:#ffffff;background-color:rgba(0, 0, 0, 0.5)"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z"></path></svg></button><div class="sliderberg-slide-indicators"></div><button class="sliderberg-nav-button sliderberg-next" aria-label="Next Slide" data-shape="circle" data-size="medium" style="color:#ffffff;background-color:rgba(0, 0, 0, 0.5)"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z"></path></svg></button></div></div></div>
<!-- /wp:sliderberg/sliderberg -->';

        $post_data = array(
            'post_title'    => __('New Post with SliderBerg', 'sliderberg'),
            'post_content'  => $post_content,
            'post_status'   => 'draft',
            'post_type'     => 'post',
            'post_author'   => get_current_user_id(),
        );

        $post_id = wp_insert_post($post_data);

        if ($post_id && !is_wp_error($post_id)) {
            // Redirect to the edit screen for the new post
            $edit_url = admin_url('post.php?post=' . $post_id . '&action=edit');
            wp_redirect($edit_url);
            exit;
        } else {
            // Handle error
            wp_die(__('Failed to create post. Please try again.', 'sliderberg'));
        }
    }
}
add_action('admin_init', 'sliderberg_handle_create_post_action');

// Handle create page with slider action
function sliderberg_handle_create_page_action() {
    // Check if this is our action and verify nonce
    if (isset($_GET['action']) && $_GET['action'] === 'sliderberg_create_page' && 
        isset($_GET['_wpnonce']) && wp_verify_nonce($_GET['_wpnonce'], 'sliderberg_create_page')) {
        
        // Check user permissions
        if (!current_user_can('edit_pages')) {
            wp_die(__('You do not have permission to create pages.', 'sliderberg'));
        }

        // Create a new page with SliderBerg block using the exact format WordPress generates
        $page_content = '<!-- wp:sliderberg/sliderberg {"type":"blocks","navigationPlacement":"outside"} -->
<div style="--sliderberg-dot-color:#6c757d;--sliderberg-dot-active-color:#ffffff" data-width-preset="full" class="wp-block-sliderberg-sliderberg alignfull"><div class="sliderberg-container"><div class="sliderberg-slides"><div class="sliderberg-slides-container" data-transition-effect="slide" data-transition-duration="500" data-transition-easing="ease" data-autoplay="false" data-autoplay-speed="5000" data-pause-on-hover="true"><!-- wp:sliderberg/slide {"backgroundType":"color","backgroundColor":"#28a745","minHeight":500} -->
<div class="wp-block-sliderberg-slide sliderberg-slide sliderberg-content-position-center-center has-28-a-745-background-color has-background" style="min-height:500px;background-color:#28a745;background-image:none;background-position:center;background-size:cover;background-attachment:scroll"><div class="sliderberg-overlay" style="background-color:#000000;opacity:0"></div><div class="sliderberg-slide-content"><!-- wp:heading {"textAlign":"center","level":1,"textColor":"white"} -->
<h1 class="wp-block-heading has-white-color has-text-color has-text-align-center">Welcome to Your Landing Page</h1>
<!-- /wp:heading -->

<!-- wp:paragraph {"align":"center","textColor":"white","fontSize":"large"} -->
<p class="has-text-align-center has-white-color has-text-color has-large-font-size">Create an amazing landing page with this slider. Add compelling content, beautiful images, and call-to-action buttons to engage your visitors.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"center"}} -->
<div class="wp-block-buttons"><!-- wp:button {"backgroundColor":"white","textColor":"black","style":{"border":{"radius":"30px"},"spacing":{"padding":{"left":"2rem","right":"2rem","top":"0.75rem","bottom":"0.75rem"}}}} -->
<div class="wp-block-button"><a class="wp-block-button__link has-black-color has-white-background-color has-text-color has-background wp-element-button" style="border-radius:30px;padding-top:0.75rem;padding-right:2rem;padding-bottom:0.75rem;padding-left:2rem">Learn More</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:sliderberg/slide --></div></div></div><div class="sliderberg-navigation-bar sliderberg-navigation-bar-bottom"><div class="sliderberg-nav-controls sliderberg-nav-controls-grouped"><button class="sliderberg-nav-button sliderberg-prev" aria-label="Previous Slide" data-shape="circle" data-size="medium" style="color:#ffffff;background-color:rgba(0, 0, 0, 0.5)"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14.6 7.4L13.2 6l-6 6 6 6 1.4-1.4L9.4 12z"></path></svg></button><div class="sliderberg-slide-indicators"></div><button class="sliderberg-nav-button sliderberg-next" aria-label="Next Slide" data-shape="circle" data-size="medium" style="color:#ffffff;background-color:rgba(0, 0, 0, 0.5)"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M9.4 7.4l1.4-1.4 6 6-6 6-1.4-1.4L14.6 12z"></path></svg></button></div></div></div>
<!-- /wp:sliderberg/sliderberg -->';

        $page_data = array(
            'post_title'    => __('New Landing Page with SliderBerg', 'sliderberg'),
            'post_content'  => $page_content,
            'post_status'   => 'draft',
            'post_type'     => 'page',
            'post_author'   => get_current_user_id(),
        );

        $page_id = wp_insert_post($page_data);

        if ($page_id && !is_wp_error($page_id)) {
            // Redirect to the edit screen for the new page
            $edit_url = admin_url('post.php?post=' . $page_id . '&action=edit');
            wp_redirect($edit_url);
            exit;
        } else {
            // Handle error
            wp_die(__('Failed to create page. Please try again.', 'sliderberg'));
        }
    }
}
add_action('admin_init', 'sliderberg_handle_create_page_action');

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
    // Generate nonce for create post action
    $create_post_nonce = wp_create_nonce('sliderberg_create_post');
    $create_page_nonce = wp_create_nonce('sliderberg_create_page');
    
    // Create action URLs
    $create_post_url = admin_url('admin.php?page=sliderberg-welcome&action=sliderberg_create_post&_wpnonce=' . $create_post_nonce);
    $create_page_url = admin_url('admin.php?page=sliderberg-welcome&action=sliderberg_create_page&_wpnonce=' . $create_page_nonce);
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
                
                <!-- Quick Start Section -->
                <div class="sliderberg-welcome-section sliderberg-quick-start-section">
                    <div class="sliderberg-section-header">
                        <h2><?php _e('🚀 Quick Start', 'sliderberg'); ?></h2>
                        <p><?php _e('Get started immediately with pre-configured sliders', 'sliderberg'); ?></p>
                    </div>
                    
                    <div class="sliderberg-quick-actions">
                        <div class="sliderberg-quick-action">
                            <div class="sliderberg-quick-action-icon">📝</div>
                            <h3><?php _e('Create Post with Slider', 'sliderberg'); ?></h3>
                            <p><?php _e('Start a new blog post with a pre-configured SliderBerg block ready to customize.', 'sliderberg'); ?></p>
                            <a href="<?php echo esc_url($create_post_url); ?>" class="sliderberg-action-button sliderberg-action-button-primary">
                                <?php _e('Create Post with Slider', 'sliderberg'); ?>
                            </a>
                        </div>
                        
                        <div class="sliderberg-quick-action">
                            <div class="sliderberg-quick-action-icon">🏠</div>
                            <h3><?php _e('Create Landing Page', 'sliderberg'); ?></h3>
                            <p><?php _e('Create a stunning landing page with a hero slider to showcase your content.', 'sliderberg'); ?></p>
                            <a href="<?php echo esc_url($create_page_url); ?>" class="sliderberg-action-button sliderberg-action-button-secondary">
                                <?php _e('Create Landing Page', 'sliderberg'); ?>
                            </a>
                        </div>
                        
                    </div>
                </div>

                <!-- Getting Started Section -->
                <div class="sliderberg-welcome-section">
                    <div class="sliderberg-section-header">
                        <h2><?php _e('📖 Getting Started Guide', 'sliderberg'); ?></h2>
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