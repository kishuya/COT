/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/getTokenAddress.js [--network <name>]
*/
var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
var COTCoin = artifacts.require("./COTCoin.sol");
module.exports = function(callback) {
  	//console.log('getting token address');
	var COTCoinCrowdsaleInstance;
	COTCoinCrowdsale.deployed().then(function(instance){
		COTCoinCrowdsaleInstance = instance;
 		COTCoinCrowdsaleInstance.token().then(function(addr){
	        tokenAddress = addr;
	        return tokenAddress;

		}).then(function(tokenAddress_data){
			console.log(tokenAddress_data);
		}).catch(function(err) {
			console.log(err.message);
		});

	}).catch(function(err) {
		console.log(err.message);
	});
}


