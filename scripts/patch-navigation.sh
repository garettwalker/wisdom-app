#!/bin/bash
# Pre-build patch for @react-navigation/elements to fix ENOTDIR errors
# Accepts --platform flag (ignored, for EAS compatibility)

while [[ "$1" =~ ^-- ]]; do
  shift
done

echo "Patching @react-navigation/elements assets..."

ELEMENTS_DIR="node_modules/@react-navigation/elements"
SOURCE_ASSETS="$ELEMENTS_DIR/lib/module/assets"
TARGET_ASSETS="$ELEMENTS_DIR/assets"

# Create target directory
mkdir -p "$TARGET_ASSETS"

# Copy all assets to flatter path
if [ -d "$SOURCE_ASSETS" ]; then
  cp -r "$SOURCE_ASSETS"/* "$TARGET_ASSETS/" 2>/dev/null || true
  echo "Copied assets to $TARGET_ASSETS"
fi

# Patch JS files to use new import path
find "$ELEMENTS_DIR/lib/module" -name "*.js" -exec sed -i '' "s|from './assets/|from '../../assets/|g" {} \;

echo "Patched @react-navigation/elements successfully"
