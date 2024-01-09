const { utils } = require('@snapshot-labs/snapshot.js');
const { Alchemy } = require('alchemy-sdk');
const { fetchTokenDecimals } = require('./utils/tokenUtils');
const { processTimestamps } = require('./utils/blockUtils');
const { abi } = require('./ERC20.json');
const config = require('./config');
const EthDater = require('ethereum-block-by-date');
const fs = require('fs');
const ProgressBar = require('progress');

const provider = utils.getProvider(config.network);
const alchemy = new Alchemy({ ...config, network: config.alchemyNetwork });
const dater = new EthDater(alchemy.core);

const treasuryData = JSON.parse(fs.readFileSync('treasury_data.json', 'utf-8')).filter(org => org.chainID == config.network)
// Hardcode USDC address in all treasuries to only track this token. 
// Problems arise if that's not the case.
treasuryData.forEach(org => {
  org.token_addresses = ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'];
});
const tokens = Array.from(new Set(treasuryData.flatMap(org => org.token_addresses)));
const timestamps = JSON.parse(fs.readFileSync('timestamps.json', 'utf-8'));
const correctedTimestamps = timestamps.map(ts =>
  ts.replace('Z', '').endsWith('+00:00') ? ts.slice(0, -6) + 'Z' : ts
);
// const coinInfoMap = JSON.parse(fs.readFileSync('coin_info.json', 'utf-8'));

async function getBalances() {
  const decimalsMap = await fetchTokenDecimals(tokens, config.network, provider, abi);

  const progressBar = new ProgressBar('Processing block :block [:bar] :percent :etas', {
    total: correctedTimestamps.length,
    width: 20,
  });

  const results = await processTimestamps(
    correctedTimestamps, progressBar, dater, decimalsMap, treasuryData, provider, abi
  );

  console.log('Multicaller results', results);
  return results;
}

getBalances().then((results) => {
  fs.writeFileSync('results.json', JSON.stringify(results));
  console.log('Results have been saved to results.json');
}).catch((error) => {
  console.error('An error occurred in getBalances:', error);
});
  
  
  
  