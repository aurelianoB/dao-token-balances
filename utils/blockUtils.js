const { ethers } = require('ethers');
const { Multicaller } = require('@snapshot-labs/snapshot.js');

async function processTimestamps(timestamps, progressBar, dater, decimalsMap, treasuryData, provider, abi) {
    let results = [];
    for (const timestamp of timestamps) {
        const blockNum = await dater.getDate(timestamp).then(block => block.block);
        const blockResults = await fetchBlockResults(blockNum, treasuryData, provider, abi, decimalsMap);
        results.push(...blockResults);
        progressBar.tick({ block: blockNum });
    }
    return results;
}

async function fetchBlockResults(blockNum, treasuryData, provider, abi, decimalsMap) {
  const multi = new Multicaller(config.network, provider, abi, { blockTag: blockNum });
  treasuryData.forEach(org => {
      org.token_addresses.forEach(token => {
          multi.call(`${org.treasury_address}.${token}`, token, 'balanceOf', [org.treasury_address]);
      });
  });

  const blockResult = await multi.execute();
  return processBlockResults(blockResult, blockNum, decimalsMap, treasuryData);
}

async function processBlockResults(blockResult, blockNum, decimalsMap, treasuryDataFiltered) {
  let results = [];
  for (const org of treasuryDataFiltered) {
    const walletAddress = org.treasury_address;

    let balances = {};
    for (const token of org.token_addresses) {
      const balanceObject = blockResult[walletAddress][token];
      balances[token] = ethers.utils.formatUnits(balanceObject._hex, decimalsMap[token]);
    }
    
    results.push({
      block: blockNum,
      treasury: walletAddress,
      balances
    });
  }

  return results;
}

module.exports = { processTimestamps, fetchBlockResults, processBlockResults };