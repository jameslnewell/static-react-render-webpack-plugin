'use strict';
const evaluate = require('eval');

module.exports = asset => {
  let module;

  //evaluate the asset
  try {
    module = evaluate(asset.source, asset.path, {}, true);
  } catch (error) {
    throw new Error(`static-react-render-webpack-plugin: Error evaluating page "${asset.path}": ${error}`);
  }

  return module;
};
