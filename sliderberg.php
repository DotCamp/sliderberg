<?php
/**
 * Plugin Name: Sliderberg Slider Blocks
 * Plugin URI: https://sliderberg.com/
 * Description: A modern slider block for WordPress block editor
 * Version: 1.0.0
 * Author: DotCamp
 * Author URI: https://dotcamp.com
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
define('SLIDERBERG_VERSION', '1.0.0');
define('SLIDERBERG_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SLIDERBERG_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Load plugin text domain for translations
 */
function sliderberg_load_textdomain() {
    load_plugin_textdomain(
        'sliderberg',
        false,
        dirname(plugin_basename(__FILE__)) . '/languages'
    );
}
add_action('plugins_loaded', 'sliderberg_load_textdomain');

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function sliderberg_init() {
    // Register the block
    register_block_type(__DIR__ . '/build');

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