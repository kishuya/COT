/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/searchWhitlist.js [--network <name>] [--address=<ACCOUNT ADDRESS>]
*	About result
*		0 : not in whitelist
*		1 : in presale whitelist
*		2 : in public whitelist
*		3 : in premium whitelist
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
var WhiteList = artifacts.require("./WhiteList.sol");

module.exports = function(callback) {
  	//console.log('searching address in whitelist');
	var WhiteListInstance;
	WhiteList.deployed().then(function(instance){
		WhiteListInstance = instance;
		return WhiteListInstance.checkList(address);

	}).then(function(result){
		var search_result = result.toString(10);
		console.log(search_result);
    }).catch(function(err) {
		console.log(err.message);
	});
}


