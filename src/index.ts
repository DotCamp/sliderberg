import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';

// Import styles
import './style.css';
import './editor.css';

// Import components
import { Edit } from './edit';
import { Save } from './save';

// Import slide block
import './blocks/slide';

// Register the main block
registerBlockType('sliderberg/sliderberg', {
    title: __('SliderBerg', 'sliderberg'),
    description: __('Add a beautiful slider to your content.', 'sliderberg'),
    category: 'widgets',
    icon: 'slides',
    supports: {
        html: false,
        align: ['wide', 'full'],
        alignWide: true,
        fullWidth: true
    },
    attributes: {
        align: {
            type: 'string',
            default: 'full'
        },
        type: {
            type: 'string',
            default: ''
        }
    },
    edit: Edit,
    save: Save,
}); 