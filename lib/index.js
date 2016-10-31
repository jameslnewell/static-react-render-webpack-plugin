'use strict';
const getScriptAssetByChunkName = require('./getScriptAssetByChunkName');
const getModuleFromAsset = require('./getModuleFromAsset');
const getPropsFromModule = require('./getPropsFromModule');
const renderPage = require('./renderPage');
const replaceAsset = require('./replaceAsset');

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
   * @param {Array.<string>}  options.pages             A list of the chunk names that export a page module
   * @param {string}          [options.layout]          The name of the chunk that exports a layout module
   * @param {function}        [options.getLayoutProps]
   * @param {function}        [options.getPageProps]
   */
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, next) => {

      const layoutAsset = getScriptAssetByChunkName(this.options.layout, compilation);
      const layoutModule = getModuleFromAsset(layoutAsset); //TODO: handle errors

      getPropsFromModule(layoutModule)
        .then(layoutProps => Promise.all(this.options.pages.map(page => {

          const pageAsset = getScriptAssetByChunkName(page, compilation);
          const pageModule = getModuleFromAsset(pageAsset);

          return getPropsFromModule(pageModule)
            .then(pageProps => {

              if (Array.isArray(pageProps)) {

                return Promise.all(pageProps.map(props => {
                  return renderPage(layoutModule, layoutProps, pageModule, props)
                    .then(html => replaceAsset(compilation.assets, html, pageModule, props))
                  ;
                }));

              } else {

                return renderPage(layoutModule, layoutProps, pageModule, pageProps)
                  .then(html => replaceAsset(compilation.assets, html, pageModule, pageProps))
                ;
              }

            })
          ;

        })))
        .then(
          () => next(),
          error => {
            console.error('HANDLED: ', error);
            // compilation.errors.push(error);
            next(error) //TODO: handle?
          }
        )
      ;

    });
  }
}

module.exports = StaticReactRenderWebpackPlugin;
