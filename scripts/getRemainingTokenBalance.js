/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/getSaleRemainingTokenBalance.js [--network <name>]
*/
var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
var COTCoin = artifacts.require("./COTCoin.sol");
var OwnerAddressInfo = artifacts.require("./OwnerAddressInfo.sol");

module.exports = function(callback) {

  var sale_account;
  var unsale_account;
  var OwnerAddressInfoInstance;
  var sale_remain_balance;
  var unsale_remain_balance;
  OwnerAddressInfo.deployed().then(function(instance) {
    OwnerAddressInfoInstance = instance;
    return OwnerAddressInfoInstance.getSaleAddress();
  }).then(function(sale_owner_address) {

      sale_account = sale_owner_address;
      return OwnerAddressInfoInstance.getUnsaleAddress();
  }).then(function(unsale_owner_address){
      unsale_account = unsale_owner_address;

      COTCoinCrowdsale.deployed().then(function(instance) {
        COTCoinCrowdsaleInstance = instance;

        COTCoinCrowdsaleInstance.token().then(function(tokenAddress_data){
          var COTCoinInstance;
          COTCoinInstance = COTCoin.at(tokenAddress_data);

          //get sale user balance
          COTCoinInstance.balanceOf(sale_account).then(function(balance_data){
            balance = COTCoinInstance.totalSupply();
            balance = balance_data.toString(10);
            sale_remain_balance = web3.fromWei(balance, "ether");
            //console.log(' sale remain token balance',sale_remain_balance);
            
          }).then(function(){
              //get unsale user balance
              COTCoinInstance.balanceOf(unsale_account).then(function(balance_data){
                balance = COTCoinInstance.totalSupply();
                balance = balance_data.toString(10);
                unsale_remain_balance = web3.fromWei(balance, "ether");
                //console.log(' unsale remain token balance',unsale_remain_balance);
              }).then(function(){
                  console.log(parseInt(unsale_remain_balance)+parseInt(sale_remain_balance));
              }).catch(function(err) {
                console.log(err.message);
              });
          }).catch(function(err) {
            console.log(err.message);
          });
        }).catch(function(err){
          console.log(err.message);
        });
      }).catch(function(err) {
        console.log(err.message);
      });
  }).catch(function(err) {
    console.log(err.message);
  });
}
