const defaultConfig = require('@wordpress/scripts/config/webpack.config');

module.exports = {
    ...defaultConfig,
    entry: {
        index: './src/index.ts',
        editor: './src/editor.ts',
        view: './src/view.ts'
    }
}; 