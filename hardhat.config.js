require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

module.exports = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      chainId: 11155111,
    },
    testnet: {
      url: "https://sepolia-rpc.scroll.io/" || "",
      chainId: 534351,
    },
  }
};
