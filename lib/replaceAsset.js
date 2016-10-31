
module.exports = (assets, html, pageModule, pageProps) => {

  if (typeof pageModule.getPath !== 'function') {
    throw new Error(`static-react-render-webpack-plugin: Expected \`getPath\` in asset "${pageModule.path}" to be a "function".`);
  }

  const url = pageModule.getPath(pageProps);

  assets[url] = {

    size() {
      return html.length;
    },

    source() {
      return html;
    }

  };

};
