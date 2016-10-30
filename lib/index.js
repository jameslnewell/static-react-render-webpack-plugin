'use strict';
const getScriptAssetByChunkName = require('./getScriptAssetByChunkName');
const getModuleFromAsset = require('./getModuleFromAsset');
const getPropsFromModule = require('./getPropsFromModule');

const defaultOptions = {
  layout: null,
  pages: [],
  getLayoutProps: props => props,
  getPageProps: props => props
};

class StaticReactRenderWebpackPlugin {

  /**
   * Construct the plugin
   * @param {object}          options
   * @param {string}          options.layout            The name of the chunk that exports a layout module
   * @param {Array.<string>}  options.pages             A list of the chunk names that export a page module
   * @param {function}        [options.getLayoutProps]
   * @param {function}        [options.getPageProps]
   */
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, next) => {

      const layoutAsset = getScriptAssetByChunkName(this.options.layout);
      const layoutModule = getModuleFromAsset(layoutAsset);

      getPropsFromModule(layoutModule)
        .then(layoutProps => Promise.all(this.options.pages.map(page => {

          const pageAsset = getScriptAssetByChunkName(page);
          const pageModule = getModuleFromAsset(pageAsset);

          return getPropsFromModule(pageModule)
            .then(pageProps => {

              if (Array.isArray(pageProps)) {

                return Promise.all(pageProps.map(props => {
                  return renderPage(layoutModule, layoutProps, pageModule, props)
                    .then(html => replaceAsset(html, pageAsset.path))
                  ;
                });

              } else {

                return renderPage(layoutModule, layoutProps, pageModule, pageProps)
                  .then(html => replaceAsset(html, pageAsset.path))
                ;
              }

            })
          ;

        })))
        .then(
          () => next(), error => next(error) //TODO: fix error handling
        )
      ;

    }));
  }
}

module.exports = StaticReactRenderWebpackPlugin;
