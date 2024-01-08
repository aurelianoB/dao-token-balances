require('dotenv').config();

module.exports = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: process.env.NETWORK || '1', // Default to Ethereum mainnet
};