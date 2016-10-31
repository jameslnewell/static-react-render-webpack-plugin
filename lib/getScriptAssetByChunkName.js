
module.exports = (name, compilation) => {

  //find a chunk by chunk name
  const chunk = compilation.chunks.find(chunk => chunk.name === name);
  if (!chunk) {
    throw new Error(`static-react-render-webpack-plugin: Chunk "${name}" was not found.`);
  }

  //find an asset by file name
  const fileIndex = chunk.files.findIndex(file => /\.js$/.test(file));
  const filePath = chunk.files[fileIndex];

  //check the asset exists
  if (!compilation.assets[filePath]) {
    throw new Error(`static-react-render-webpack-plugin: Script asset for chunk "${name}" was not found.`);
  }

  const fileAsset = {
    path: filePath,
    source: compilation.assets[filePath].source()
  };

  //remove the asset from the compilation
  chunk.files.splice(fileIndex, 1);
  delete compilation.assets[filePath];

  return fileAsset;
};
