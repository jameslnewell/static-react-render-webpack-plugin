'use strict';
const evaluate = require('eval');

module.exports = (asset, compilation) => {

  //evaluate the asset
  let module;
  try {
    module = evaluate(asset.source, asset.path, {}, true);
  } catch (error) {
    compilation.errors.push(`Error evaluating page "${asset.path}": ${error}`);
    return;
  }

  //check the module for a component
  if (typeof module.default !== 'function') {
    compilation.errors.push(`Page "${asset.path}" does not export a React component as the "default" export.`);
    return;
  }

};
