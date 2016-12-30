'use strict';
const evaluate = require('eval');

/**
 * @param   {object} asset
 * @param   {string} asset.path
 * @param   {string} asset.source
 * @returns {object}
 */
module.exports = asset => {
  let module;

  //evaluate the asset source
  try {
    module = evaluate(asset.source, asset.path, {}, true);
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
