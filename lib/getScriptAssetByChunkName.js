
module.exports = (chunkName, compilation) => {

  //find a chunk by chunk name
  const chunk = compilation.chunks.find(chunk => chunk.name === name);
  if (!chunk) return null;

  //find an asset by file name
  return chunk.files
    .filter(file => compilation.assets[file])
    .map(file => ({
      path: file,
      source: compilation.assets[file].source()
    }))
  ;

};
