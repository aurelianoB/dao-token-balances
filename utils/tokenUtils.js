const snapshot = require('@snapshot-labs/snapshot.js');
// const {Multicaller} = snapshot.utils//require('@snapshot-labs/snapshot.js/src/utils');

async function fetchTokenDecimals(tokens, network, provider, abi) {
  const decimalsMap = {};
  // console.log(Multicaller.prototype)
  const multiDecimals = new snapshot.utils.Multicaller(network, provider, abi);
  // console.log(multiDecimals)

  tokens.forEach((token) => {
    multiDecimals.call(token, token, 'decimals');
  });

  const decimalsResult = await multiDecimals.execute();
  console.log(decimalsResult)
  tokens.forEach((token) => {
    decimalsMap[token] = decimalsResult[token];
  });

  return decimalsMap;
}

module.exports = { fetchTokenDecimals };