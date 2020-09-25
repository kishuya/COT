/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/getAccountTokenBalance.js [--network <name>] [--address=<ACCOUNT ADDRESS>]
*/
//process.argv
var args = require('minimist')(process.argv.slice(2),{string: ["address"]});
var address = '';

if(args['address'] == null){
  console.log('format error');
  process.exit(1);
}

address = args['address'];

var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
var COTCoin = artifacts.require("./COTCoin.sol");
module.exports = function(callback) {
	//console.log('Getting address token balances...');
	var COTCoinCrowdsaleInstance;

	COTCoinCrowdsale.deployed().then(function(instance){
		COTCoinCrowdsaleInstance = instance;

    COTCoinCrowdsaleInstance.token().then(function(addr){
      tokenAddress = addr;
      return tokenAddress;

    }).then(function(tokenAddress_data){
        var COTCoinInstance;
        COTCoinInstance = COTCoin.at(tokenAddress_data);

        //get user balance
        COTCoinInstance.balanceOf(address).then(function(balance_data){
          balance = COTCoinInstance.totalSupply();
          return balance_data.toString(10);

        }).then(function(result){
          balance =  web3.fromWei(result, "ether")
          console.log(balance);
        }).catch(function(err) {
          console.log(err.message);
        });
    }).catch(function(err){
      console.log(err.message);
    });
	}).catch(function(err) {
		console.log(err.message);
	});
}
