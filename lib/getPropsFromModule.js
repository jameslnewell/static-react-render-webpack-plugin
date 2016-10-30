'use strict';

module.exports = module => {

  if (module.getProps) {

    if (typeof module.getProps !== 'function') {
      throw new Error(`static-react-render-webpack-plugin: Expected \`getProps\` in "${asset.path}" to be a "function".`);
    }

    return Promise.resolve(module.getProps())
      .then(props => {
        if (typeof props !== 'object') {
          throw new Error(`static-react-render-webpack-plugin: Expected \`getProps\` in "${asset.path}" to return an "object"."`);
        }
        return props;
      })
    ;
  }

  return Promise.resolve({});
};

