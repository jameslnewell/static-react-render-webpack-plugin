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
    console.log('ERROR');
    throw new Error(`static-react-render-webpack-plugin: Error evaluating asset "${asset.path}": ${error}`);
  }

  return {
    path: asset.path,
    getProps: module.default && module.default.getProps || null,
    getPath: module.default && module.default.getPath || null,
    component: module.default
  };
};
