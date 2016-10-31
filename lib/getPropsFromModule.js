'use strict';

/**
 * @param   {object}    module
 * @param   {string}    module.path
 * @param   {function}  module.getProps
 * @returns {Promise.<object>}
 */
module.exports = module => {

  if (module.getProps) {

    if (typeof module.getProps !== 'function') {
      throw new Error(`static-react-render-webpack-plugin: Expected \`getProps\` in asset "${module.path}" to be a "function".`);
    }

    return Promise.resolve(module.getProps())
      .then(props => {

        if (typeof props !== 'object' && !(Array.isArray(props) && props.every(prop => typeof prop === 'object'))) {
          throw new Error(`static-react-render-webpack-plugin: Expected \`getProps\` in asset "${module.path}" to return an "object" or an "array" of "objects".`);
        }
        return props;
      })
    ;
  }

  return Promise.resolve({});
};

