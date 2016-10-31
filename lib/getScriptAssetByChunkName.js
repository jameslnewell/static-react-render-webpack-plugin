
module.exports = (name, compilation) => {

  //find a chunk by chunk name
  const chunk = compilation.chunks.find(chunk => chunk.name === name);
  if (!chunk) {
    throw new Error(`static-react-render-webpack-plugin: Chunk "${name}" was not found.`);
  }

  //find an asset by file name
  const assets = chunk.files
    .filter(file => compilation.assets[file])
    .map(file => ({
      path: file,
      source: compilation.assets[file].source()
    }))
  ;
  if (assets.length === 0) {
    throw new Error(`static-react-render-webpack-plugin: Script asset for chunk "${name}" was not found.`);
  }

  return assets[0];
};
