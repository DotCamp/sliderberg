#!/bin/bash

# Plugin name
PLUGIN_NAME="sliderberg"

# Version from readme.txt
VERSION=$(grep "Stable tag:" readme.txt | cut -d' ' -f3)

# Create build directory if it doesn't exist
mkdir -p build

# Create a temporary directory for building
TEMP_DIR="build/temp"
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy plugin files to temp directory, excluding unnecessary files
rsync -av --progress ./ "$TEMP_DIR/$PLUGIN_NAME" \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude '.gitignore' \
    --exclude 'package-lock.json' \
    --exclude 'package.json' \
    --exclude 'webpack.config.js' \
    --exclude 'tsconfig.json' \
    --exclude 'README.md' \
    --exclude 'build-plugin.sh' \
    --exclude '.DS_Store' \
    --exclude '*.zip'

# Create zip file
cd "$TEMP_DIR"
zip -r "../../$PLUGIN_NAME-$VERSION.zip" "$PLUGIN_NAME"
cd ../..

# Clean up
rm -rf "$TEMP_DIR"

echo "Plugin zip file created: $PLUGIN_NAME-$VERSION.zip in parent directory" 