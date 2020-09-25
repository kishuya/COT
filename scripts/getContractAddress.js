/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/getContractAddress.js [--network <name>]
*/
var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
module.exports = function(callback) {
  	//console.log('getting contract address');
	var COTCoinCrowdsaleInstance;

	COTCoinCrowdsale.deployed().then(function(instance){
		COTCoinCrowdsaleInstance = instance;
		console.log(COTCoinCrowdsaleInstance.address);
	}).catch(function(err) {
		console.log(err.message);
	});
}
