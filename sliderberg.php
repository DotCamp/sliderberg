<?php
/**
 * Plugin Name: Sliderberg
 * Plugin URI: https://sliderberg.com/
 * Description: Slider Block For the Block Editor (Gutenberg). Slide Anything With Ease.
 * Version: 1.0.1
 * Author: DotCamp
 * Author URI: https://dotcamp.com/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: sliderberg
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Define plugin constants
define('SLIDERBERG_VERSION', '1.0.1');
define('SLIDERBERG_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SLIDERBERG_PLUGIN_URL', plugin_dir_url(__FILE__));

if ( ! function_exists( 'sli_fs' ) ) {
    // Create a helper function for easy SDK access.
    function sli_fs() {
        global $sli_fs;

        if ( ! isset( $sli_fs ) ) {
            // Include Freemius SDK.
            require_once dirname( __FILE__ ) . '/vendor/freemius/start.php';
            $sli_fs = fs_dynamic_init( array(
                'id'                  => '19340',
                'slug'                => 'sliderberg',
                'type'                => 'plugin',
                'public_key'          => 'pk_f6a90542b187793a33ebb75752ce7',
                'is_premium'          => false,
                'has_addons'          => false,
                'has_paid_plans'      => false,
                'menu'                => array(
                    'slug'           => 'sliderberg-welcome',
                    'contact'        => false,
                ),
            ) );
        }

        return $sli_fs;
    }

    // Init Freemius.
    sli_fs();
    // Signal that SDK was initiated.
    do_action( 'sli_fs_loaded' );
}

// Include admin welcome page
require_once SLIDERBERG_PLUGIN_DIR . 'includes/admin-welcome.php';

// Include slider and slide renderer
require_once SLIDERBERG_PLUGIN_DIR . 'includes/slider-renderer.php';
require_once SLIDERBERG_PLUGIN_DIR . 'includes/slide-renderer.php';

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function sliderberg_init() {
    
    // Register slider block with PHP rendering
    sliderberg_register_slider_block();
    
    // Register slide block with PHP rendering
    sliderberg_register_slide_block();

    // Register block styles
    wp_register_style(
        'sliderberg-style',
        SLIDERBERG_PLUGIN_URL . 'build/style-index.css',
        array(),
        SLIDERBERG_VERSION
    );

    // Register editor styles
    wp_register_style(
        'sliderberg-editor',
        SLIDERBERG_PLUGIN_URL . 'build/index.css',
        array(),
        SLIDERBERG_VERSION
    );

    // Register view script
    wp_register_script(
        'sliderberg-view',
        SLIDERBERG_PLUGIN_URL . 'build/view.js',
        array(),
        SLIDERBERG_VERSION,
        true
    );
}
add_action('init', 'sliderberg_init');

// Enqueue editor assets
function sliderberg_editor_assets() {
    wp_enqueue_script(
        'sliderberg-editor',
        SLIDERBERG_PLUGIN_URL . 'build/index.js',
        array('wp-blocks', 'wp-element', 'wp-editor'),
        SLIDERBERG_VERSION,
        true
    );
    // Enqueue the custom editor-only JS for slide visibility
    wp_enqueue_script(
        'sliderberg-editor-js',
        SLIDERBERG_PLUGIN_URL . 'build/editor.js',
        array(),
        SLIDERBERG_VERSION,
        true
    );
}
add_action('enqueue_block_editor_assets', 'sliderberg_editor_assets');

// Enqueue frontend assets
function sliderberg_frontend_assets() {
    // Only enqueue if we have sliderberg blocks on the page
    if (has_block('sliderberg/sliderberg')) {
        wp_enqueue_style('sliderberg-style');
        wp_enqueue_script('sliderberg-view');
    }
}
add_action('wp_enqueue_scripts', 'sliderberg_frontend_assets'); 