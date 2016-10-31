'use strict';
const React = require('react');
const ReactDOM = require('react-dom/server');

/**
 * @param   {object}    layoutModule
 * @param   {function}  layoutModule.component
 * @param   {object}    layoutProps
 * @param   {object}    pageModule
 * @param   {string}    pageModule.path
 * @param   {function}  pageModule.component
 * @param   {object}    pageProps
 * @returns {Promise.<string>}
 */
module.exports = (layoutModule, layoutProps, pageModule, pageProps) => {
  try {

    if (typeof layoutModule.component !== 'function') {
      throw new Error(`static-react-render-webpack-plugin: Expected \`default\` in asset "${layoutModule.path}" to be a "React.Component".`);
    }

    if (typeof pageModule.component !== 'function') {
      throw new Error(`static-react-render-webpack-plugin: Expected \`default\` in asset "${pageModule.path}" to be a "React.Component".`);
    }

    const html = ReactDOM.renderToStaticMarkup(

      React.createElement(
        layoutModule.component,
        layoutProps,

        React.createElement(
          pageModule.component,
          pageProps
        )

      )

    );

    return Promise.resolve(html);
  } catch (error) {
    return Promise.reject(`Error rendering page "${pageModule.path}": ${error.stack}`);
  }
};