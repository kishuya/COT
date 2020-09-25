
require('babel-register');
require('babel-polyfill');
var HDWalletProvider = require("truffle-hdwallet-provider");
var args = require('minimist')(process.argv.slice(2));

var mnemonic = ""; //need to fill out the wallet key before deploy

if((args['network'] == "live_for_infura") || args['network'] == "rinkeby_for_infura"){
  if(mnemonic == ""){
    console.log("you forget to enter mnemonic");
    process.exit(1);  
  }
}

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    live:{ // this will deploy to the live network
      host: "localhost",
      port: 8545,
      network_id: 1
    },
    live_for_infura:{ // this will deploy to the live network
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/teiJTlGBphLqKMGfFz5J", 0);
      },
      network_id: 1
    },    
    development: { // this will deploy to the dev testrpc or ganache-cli network
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    privateGethNet: { // this will deploy to the dev geth network
      host: "localhost",
      port: 8545,
      network_id: "15",
      from: "0x627306090abab3a6e1400e9345bc60c78a8bef57" //please change this to your address
    },
    rinkeby: { // this will deploy to the rinkeby test network
      host: "localhost",
      port: 8545,
      network_id: "4", //rinkeby default id
      from: "0x627306090abab3a6e1400e9345bc60c78a8bef57" //please change this to your address
    },
    rinkeby_for_infura: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/teiJTlGBphLqKMGfFz5J", 0);
      },
      network_id: 4
    }      
  }
};
