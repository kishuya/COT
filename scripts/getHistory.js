/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/getHistory.js [--network <name>]
*/
/*
var jsdom = require('jsdom');
const { JSDOM } = jsdom;
const { window } = new JSDOM('<html></html>');
var $ = require('jquery')(window);
*/
var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
var COTCoin = artifacts.require("./COTCoin.sol");
module.exports = function(callback) {

  var history ={};
  var COTCoinCrowdsaleInstance;
  COTCoinCrowdsale.deployed().then(function(instance){
    COTCoinCrowdsaleInstance = instance;
    COTCoinCrowdsaleInstance.token().then(function(addr){
          tokenAddress = addr;
          return tokenAddress;

    }).then(function(tokenAddress_data){
      //console.log(tokenAddress_data);
      var options = {
        address: tokenAddress_data,
        fromBlock: 1,
        toBlock: 'latest'
      };

      web3.eth.filter(options).get( function (err, result) {
        var blockHash;
        var transactionHash;

        var blockHash_result;
        var transactionHash_result;

        for(var index = 0; index < result.length; index ++){

          history[index] = {
            time:null,
            from:null,
            to:null,
            value:null
          };
          blockHash = result[index].blockHash;
          transactionHash = result[index].transactionHash;
          
      
          blockHash_result = web3.eth.getBlock(blockHash);
          
          var timestamp = new Date(parseInt(blockHash_result.timestamp)*1000);
          var year = timestamp.getFullYear();
          var month = timestamp.getMonth() + 1;
          var date = timestamp.getDate();
          var hour = timestamp.getHours();
          var min = timestamp.getMinutes();
          var sec = timestamp.getSeconds();
          time =  year + '/' + month + '/' +  date + ' ' + hour + ':' + min + ':' + sec ;
          //console.log(result);
          history[index]['time'] = time;
          //console.log(time);
        
          transactionHash_result = web3.eth.getTransaction(transactionHash);
          var from = transactionHash_result.from;
          var to = transactionHash_result.to;
          var value = transactionHash_result.value;
          value = value.toString(10);
          var ether_amount =  web3.fromWei(value, "ether");
          history[index]['from'] = transactionHash_result.from;
          history[index]['to'] = transactionHash_result.to;
          history[index]['value'] = ether_amount;
          //console.log(receipt);
          //console.log(history[index]);
        }

        console.log(history);
      })

    }).catch(function(err) {
      console.log(err.message);
    });

  }).catch(function(err) {
    console.log(err.message);
  });


}
