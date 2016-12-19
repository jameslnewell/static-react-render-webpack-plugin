'use strict';
const getChunkByName = require('./getChunkByName');
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
   * @param {string}          [options.layout]            The name of the layout chunk.
   * @param {Array.<string>}  options.pages               The names of the page chunks.
   * @param {function}        [options.getLayoutProps]    A function modifying the props passed to the layout component.
   * @param {function}        [options.getPageProps]      A function modifying the props passed to the page component.
   */
  constructor(options) {
    this.options = Object.assign({}, defaultOptions, options);
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, next) => {

      const layoutChunk = getChunkByName(this.options.layout, compilation.chunks);
      const layoutAsset = getScriptAssetByChunkName(this.options.layout, compilation);
      let layoutModule;
      try {
        layoutModule = getModuleFromAsset(layoutAsset);
      } catch (error) {
        return next(error);
      }

      getPropsFromModule(layoutModule)
        .then(layoutProps => Promise.all(this.options.pages.map(page => {

          const pageChunk = getChunkByName(page, compilation.chunks);
          const pageAsset = getScriptAssetByChunkName(page, compilation);
          let pageModule;
          try {
            pageModule = getModuleFromAsset(pageAsset);
          } catch (error) {
            return Promise.reject(error);
          }

          return Promise.resolve(this.options.getLayoutProps(layoutProps, {
            pageChunk: pageChunk,
            layoutChunk: layoutChunk,
            compilation
          }))
            .then(modifiedLayoutProps => {

              return getPropsFromModule(pageModule)
                .then(pageProps => {

                  if (Array.isArray(pageProps)) {

                    return Promise.all(pageProps.map(props => {

                      //modify the page props
                      return Promise.resolve(this.options.getPageProps(props, {
                        pageChunk: pageChunk,
                        layoutChunk: layoutChunk,
                        compilation
                      }))

                      //render the page
                        .then(modifiedPageProps => renderPage(layoutModule, modifiedLayoutProps, pageModule, props)
                          .then(html => replaceAsset(compilation.assets, html, pageModule, modifiedPageProps))
                        )

                      ;

                    }));

                  } else {

                    //modify the page props
                    return Promise.resolve(this.options.getPageProps(pageProps, {
                      pageChunk: pageChunk,
                      layoutChunk: layoutChunk,
                      compilation
                    }))

                    //render the page
                      .then(modifiedPageProps => renderPage(layoutModule, modifiedLayoutProps, pageModule, modifiedPageProps)
                        .then(html => replaceAsset(compilation.assets, html, pageModule, modifiedPageProps))
                      )

                    ;

                  }

                })

                //handle errors rendering this page, allowing other pages to continue rendering
                .catch(error => compilation.errors.push(error))

              ;

            })
          ;

        })))
          .then(
            () => next(),
            error => {
              compilation.errors.push(error);
              next();
            }
          )
      ;

    });
  }
}

module.exports = StaticReactRenderWebpackPlugin;
