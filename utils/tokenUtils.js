const snapshot = require('@snapshot-labs/snapshot.js');
const {Multicaller} = snapshot.utils

async function fetchTokenDecimals(tokens, network, provider, abi) {
  const decimalsMap = {};
  const multiDecimals = new Multicaller(network, provider, abi);

  tokens.forEach((token) => {
    multiDecimals.call(token, token, 'decimals');
  });

  const decimalsResult = await multiDecimals.execute();
  tokens.forEach((token) => {
    decimalsMap[token] = decimalsResult[token];
  });

  return decimalsMap;
}

module.exports = { fetchTokenDecimals };