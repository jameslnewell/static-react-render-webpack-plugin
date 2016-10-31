
/**
 * Find a chunk by chunk name
 * @param   {string}          name
 * @param   {Array.<object>}  chunks
 * @returns {object}
 */
module.exports = (name, chunks) => {
  const chunk = chunks.find(chunk => chunk.name === name);
  if (!chunk) {
    throw new Error(`static-react-render-webpack-plugin: Chunk "${name}" was not found.`);
  }

  return chunk;
};
