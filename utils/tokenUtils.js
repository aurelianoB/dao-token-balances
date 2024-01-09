const snapshot = require('@snapshot-labs/snapshot.js');
const {Multicaller} = snapshot.utils

async function fetchTokenDecimals(tokens, network, provider, abi) {
  const decimalsMap = {};
  const multiDecimals = new Multicaller(network, provider, abi);

  tokens.forEach((token) => {
    multiDecimals.call(`${token}.decimals`, token, 'decimals');
  });

  return multiDecimals.execute().then((decimalsResult) => {
    tokens.forEach((token) => {
      decimalsMap[token] = decimalsResult[`${token}.decimals`];
    });
    return decimalsMap;
  });
}

module.exports = { fetchTokenDecimals };