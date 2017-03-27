'use strict';
const path = require('path');
const evaluate = require('eval');

/**
 * @param   {object} asset
 * @param   {string} asset.path
 * @param   {string} asset.source
 * @param   {string} outputDir
 * @returns {object}
 */
module.exports = (asset, outputDir) => {
  let module;

  //evaluate the asset source
  try {
    const assetPath = path.resolve(outputDir, asset.path);
    module = evaluate(asset.source, asset.path, {
      __dirname: path.dirname(assetPath),
      __filename: assetPath
    }, true);
  } catch (error) {
    throw new Error(`static-react-render-webpack-plugin: Error evaluating asset "${asset.path}": ${error}`);
  }

  //handle transpilation
  if (module.default) {
    module = module.default;
  }

  return {
    path: asset.path,
    getProps: module.getProps || null,
    getPath: module.getPath || null,
    component: module
  };
};
