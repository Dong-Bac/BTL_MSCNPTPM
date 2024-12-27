require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  networks: {
    sepolia: {
      url: 'https://sepolia.infura.io/v3/8f7dbb853823467f9f1dbce7f5189b6f',
      accounts: ['a08fabe2f46627b4f0201a3bceca6a6a4ea8fca9bbb7a7367c46b2476482df3e'],
    },
  },
};
