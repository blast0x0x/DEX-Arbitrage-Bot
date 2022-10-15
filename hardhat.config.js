require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    aurora: {
      url: `https://mainnet.aurora.dev`,
      accounts: [process.env.privateKey]
    },
    fantom: {
      url: `https://rpc.ftm.tools/`,
      gas: 3000000,
      accounts: [process.env.privateKey]
    },
    bsc: {
      url: 'https://bscrpc.com',
      gas: 3000000,
      accounts: [process.env.privateKey]
    }
  },
  solidity: {
    compilers: [
      { version: "0.8.7" },
      { version: "0.7.6" },
      { version: "0.6.6" }
    ]
  },
  etherscan: {
    apiKey: process.env.BSC_API_KEY
  }
};
