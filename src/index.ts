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
        },
        navigationType: {
            type: 'string',
            default: 'bottom'
        },
        navigationPlacement: {
            type: 'string',
            default: 'overlay'
        },
        navigationShape: {
            type: 'string',
            default: 'circle'
        },
        navigationSize: {
            type: 'string',
            default: 'medium'
        },
        navigationColor: {
            type: 'string',
            default: '#ffffff'
        },
        navigationBgColor: {
            type: 'string',
            default: 'rgba(0, 0, 0, 0.5)'
        },
        navigationOpacity: {
            type: 'number',
            default: 1
        },
        navigationVerticalPosition: {
            type: 'number',
            default: 20
        },
        navigationHorizontalPosition: {
            type: 'number',
            default: 20
        },
        dotColor: {
            type: 'string',
            default: '#6c757d'  // grey
        },
        dotActiveColor: {
            type: 'string',
            default: '#ffffff'  // white
        }
    },
    edit: Edit,
    save: Save,
}); 