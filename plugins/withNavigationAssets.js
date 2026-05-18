const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withNavigationAssets(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const elementsPath = path.join(config.modRequest.projectRoot, 'node_modules', '@react-navigation', 'elements');
      const sourceAssetsDir = path.join(elementsPath, 'lib', 'module', 'assets');
      const targetAssetsDir = path.join(elementsPath, 'assets');

      if (!fs.existsSync(sourceAssetsDir)) {
        console.log('Navigation elements assets not found');
        return config;
      }

      // Create target directory
      if (!fs.existsSync(targetAssetsDir)) {
        fs.mkdirSync(targetAssetsDir, { recursive: true });
      }

      // Copy all assets
      const assets = fs.readdirSync(sourceAssetsDir);
      assets.forEach(asset => {
        const sourcePath = path.join(sourceAssetsDir, asset);
        const targetPath = path.join(targetAssetsDir, asset);
        if (fs.statSync(sourcePath).isFile()) {
          fs.copyFileSync(sourcePath, targetPath);
        }
      });

      // Patch JS files
      const moduleDir = path.join(elementsPath, 'lib', 'module');
      const files = fs.readdirSync(moduleDir).filter(f => f.endsWith('.js'));
      files.forEach(file => {
        const filePath = path.join(moduleDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        content = content.replace(/from '\.\/assets\//g, "from '../../assets/");
        fs.writeFileSync(filePath, content);
      });

      console.log('Patched @react-navigation/elements assets');
      return config;
    },
  ]);
};
