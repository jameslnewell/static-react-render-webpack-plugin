'use strict';
const path = require('path');
const React = require('react');
const ReactDOM = require('react-dom/server');
const evaluate = require('eval');

/**
 * Get a chunk by name
 * @param   {string} name
 * @param   {object} compilation
 * @returns {object}
 */
function getChunkByName(name, compilation) {
  return compilation.chunks.find(chunk => chunk.name === name);
}

/**
 * Get the assets
 * @param   {object} chunk
 * @param   {object} compilation
 * @returns {Array<object>}
 */
const getChunkAssets = (chunk, compilation) => chunk.files
  .filter(file => compilation.assets[file])
.map(file => ({
  path: file,
  source: compilation.assets[file].source()
}))
;

/**
 * Get the script assets
 * @param   {Object} chunk
 * @param   {Object} compilation
 * @returns {Object}
 */
function getScriptAssets(chunk, compilation) {
  return getChunkAssets(chunk, compilation)
      .filter(asset => /\.js$/.test(asset.path))
  ;
}

/**
 * Get the style assets
 * @param   {Object} chunk
 * @param   {Object} compilation
 * @returns {Object}
 */
function getStyleAssets(chunk, compilation) {
  return getChunkAssets(chunk, compilation)
      .filter(asset => /\.css/.test(asset.path))
  ;
}

function getScriptAssetsFromCache(chunkName, assetsByChunkNameCache) {
  return Object.keys(assetsByChunkNameCache)
      .filter(cn => path.dirname(cn) === path.dirname(chunkName))
.map(chunkName => assetsByChunkNameCache[chunkName])
.filter(asset => /\.js/.test(asset))
  ;
}

/**
 * @param   {object} chunk
 * @param   {object} compilation
 */
function getLayoutModuleFromChunk(chunk, compilation) {

  //get the asset
  const asset = getScriptAssets(chunk, compilation)[0];
  if (typeof asset !== 'object') {
    compilation.errors.push(`Chunk "${chunk.name}" does not have a script asset.`);
    return;
  }

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

  //remove the asset
  delete compilation.assets[asset.path];

  return {
    src: asset.path,
    fetchData: module.fetchData,
    component: module.default
  };
}

/**
 * @param   {object} chunk
 * @param   {object} compilation
 */
function getPageModuleFromChunk(chunk, compilation) {

  //get the asset
  const asset = getScriptAssets(chunk, compilation)[0];
  if (typeof asset !== 'object') {
    compilation.errors.push(`Chunk "${chunk.name}" does not have a script asset.`);
    return;
  }

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

  //remove the asset
  delete compilation.assets[asset.path];

  return {
    src: asset.path,
    dest: module.path,
    fetchData: module.fetchData,
    component: module.default
  };
}

/**
 * Fetch the module data
 * @param   {object} module
 * @param   {object} compilation
 * @returns {Promise}
 */
function fetchData(module, compilation) {
  if (module.fetchData) {

    if (typeof module.fetchData !== 'function') {
      compilation.errors.push(`Error fetching data for page ${module.src}: \`fetchData()\` is not a function.`);
      return Promise.resolve({});
    }

    return Promise.resolve(module.fetchData())
        .catch(error => {
        compilation.errors.push(`Error fetching data for page ${pageModule.src}: ${error}`);
    return {};
  })
    ;

  } else {
    return Promise.resolve({});
  }
}

function createAsset(source) {
  return {
    source: function() {
      return source;
    },
    size: function() {
      return source.length;
    }
  };
}


class RenderStaticPagesPlugin {

  constructor(options) {
    this.metadata = options.metadata;
    this.assetsByChunkNameCache = options.assetsByChunkNameCache;
  }

  apply(compiler) {
    compiler.plugin('emit', (compilation, next) => {

      //get the layout chunk
      const layoutChunk = getChunkByName(this.metadata.layout.chunkName, compilation);
    if (!layoutChunk) {
      compilation.errors.push(`Layout chunk "${this.metadata.layout.chunkName}" was not found.`);
      return next();
    }

    //get the layout module
    const layoutModule = getLayoutModuleFromChunk(layoutChunk, compilation);
    if (!layoutModule) {
      return next();
    }

    //get the layout data
    fetchData(layoutModule, compilation)

      .then(layoutData => {

      const promises = [];
    compilation.chunks.forEach(pageChunk => {

      //ignore the layout chunk
      if (pageChunk.name === this.metadata.layout.chunkName) {
      return;
    }

    //get the page module
    const pageModule = getPageModuleFromChunk(pageChunk, compilation);
    if (!pageModule) {
      return;
    }

    promises.push(

      //get the page data
      fetchData(pageModule, compilation)

      //render the page
        .then(pageData => {

        //render the component and create a new asset
        const rootPath = path.relative(path.dirname(pageModule.path), '.');
    let html;
    try {
      html = ReactDOM.renderToStaticMarkup(
        React.createElement(
          layoutModule.component,
          Object.assign({
            root: rootPath,
            scripts: [].concat(
              getScriptAssetsFromCache('vendor', this.assetsByChunkNameCache)
                .map(asset => path.join(compilation.outputOptions.publicPath, asset)),
            getScriptAssetsFromCache(this.metadata.layout.chunkName, this.assetsByChunkNameCache)
            .map(asset => path.join(compilation.outputOptions.publicPath, asset)),
        getScriptAssetsFromCache(pageChunk.name, this.assetsByChunkNameCache)
          .map(asset => path.join(compilation.outputOptions.publicPath, asset))
    ),
      styles: [].concat(
        getStyleAssets(layoutChunk, compilation)
          .map(asset => asset.path)
        .map(asset => path.join(compilation.outputOptions.publicPath, asset)),
      getStyleAssets(pageChunk, compilation)
        .map(asset => asset.path)
    .map(asset => path.join(compilation.outputOptions.publicPath, asset))
    ),
    }, layoutData),
      React.createElement(
        pageModule.component,
        Object.assign({
          root: rootPath
        }, pageData)
      )
    )
    );
    } catch (error) {
      compilation.errors.push(`Error rendering page: ${error.stack}`);
      return;
    }

    //create an asset for the HTML
    compilation.assets[this.metadata.pages.find(page => page.chunkName === pageChunk.name).html] = createAsset(html);

  })
  );

  });

    return Promise.all(promises);
  })
  .then(() => next(), () => next())
    ;

  });
  }

}

module.exports = RenderStaticPagesPlugin;
