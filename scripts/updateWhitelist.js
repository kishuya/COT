/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/updateWhitelist.js [--network <name>] [--type=<WHITELIST TYPE>]
*	About the type
*		1. pre
*		2. public
*		3. premium
*/
//process.argv
var args = require('minimist')(process.argv.slice(2),{string: ["type"]});
var type = '';

if(args['type'] == null){
  console.log('format error');
  process.exit(1);
}

if(args['type'] == 'pre'){
	type = 1;
}else if(args['type'] == 'public'){
	type = 2;
}else if(args['type'] == 'premium'){
	type = 3;
}else{
  console.log('type error,please enter pre, public or premium');
  process.exit(1);
}

var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
var COTCoin = artifacts.require("./COTCoin.sol");
var WhiteList = artifacts.require("./WhiteList.sol");

module.exports = function(callback) {
  
var request = require('request'),
    username = "cure", //will be changed after whitelist api release
    password = "9876", //will be changed after whitelist api release
    url = "http://" + username + ":" + password + "@icocure.dong-lab.com/whitelist/get_ethaddress"; //will be changed after whitelist api release

	request(
	    { url : url},
	    function (error, response, body) {
	    	try{

	    		//body = '["0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef", "TESTTEST", "123456"]';

		    	//get whitelist from api
				var whitelist = JSON.parse(body);

				var whitelist_list = [];
				for(var index = 0; index < whitelist.length; index+=100){
					whitelist_list.push(whitelist.slice(index,index+100));
				}

				var WhiteListInstance;
				WhiteList.deployed().then(function(instance) {
				WhiteListInstance = instance;

				for(var list_index = 0; list_index < whitelist_list.length; list_index ++ ){
				  var importing_data = whitelist_list[list_index];
				  WhiteListInstance.importList(whitelist_list[list_index], type).then(function(result){
				    console.log('success');
				  }).catch(function(err) {
				    console.log(err.message);
				  });
				}  

				}).catch(function(err) {
				  console.log(err.message);
				});
			}catch(err){
				console.log(err.message);
			}

	    }
	)
}