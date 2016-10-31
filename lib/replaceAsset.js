
module.exports = (assets, html, pageModule, pageProps) => {

  //delete the source asset
  if (assets[pageModule.path]) {
    delete assets[pageModule.path];
  }

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
