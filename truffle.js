var HDWalletProvider = require("truffle-hdwallet-provider");

var mnemonic = 'expand witness two word permit argue clarify invest entry eager wrestle bomb';

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777" 
    },
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/XbAOU5EG42nnsgPntAqU", 0)
      },
      network_id: 4
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/XbAOU5EG42nnsgPntAqU", 0)
      },
      network_id: 3
    }


  }
};