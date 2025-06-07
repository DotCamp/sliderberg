jQuery(document).ready(function($) {
    // Disable buttons that are already active
    $('.sliderberg-plugin-button[data-status="active"]').prop('disabled', true);

    $('.sliderberg-plugin-button').on('click', function(e) {
        e.preventDefault();
        
        const button = $(this);
        const pluginSlug = button.data('plugin');
        const status = button.data('status');
        const nonce = button.data('nonce');
        
        // Don't proceed if button is disabled
        if (button.prop('disabled')) {
            return;
        }
        
        // Disable button and show loading state
        button.prop('disabled', true);
        const originalText = button.text();
        button.text('Processing...');
        
        if (status === 'install') {
            // Install plugin
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'sliderberg_install_plugin',
                    plugin: pluginSlug,
                    _ajax_nonce: nonce
                },
                success: function(response) {
                    if (response.success) {
                        button.data('status', 'inactive');
                        button.text('Activate');
                    } else {
                        button.text(originalText);
                        alert(response.data.message || 'Installation failed. Please try again.');
                    }
                },
                error: function() {
                    button.text(originalText);
                    alert('Installation failed. Please try again.');
                },
                complete: function() {
                    button.prop('disabled', false);
                }
            });
        } else if (status === 'inactive') {
            // Activate plugin
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'sliderberg_activate_plugin',
                    plugin: pluginSlug,
                    _ajax_nonce: nonce
                },
                success: function(response) {
                    if (response.success) {
                        button.data('status', 'active');
                        button.text('Active');
                        button.prop('disabled', true);
                        // Force a reflow to ensure the styles are applied
                        button[0].offsetHeight;
                        button.addClass('active');
                    } else {
                        button.text(originalText);
                        alert(response.data.message || 'Activation failed. Please try again.');
                    }
                },
                error: function() {
                    button.text(originalText);
                    alert('Activation failed. Please try again.');
                },
                complete: function() {
                    if (button.data('status') !== 'active') {
                        button.prop('disabled', false);
                    }
                }
            });
        }
    });
}); 