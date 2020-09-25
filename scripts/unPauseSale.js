/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/unPauseSale.js [--network <name>]
*/
var PausableToken = artifacts.require("./PausableToken.sol");

module.exports = function(callback) {
    PausableToken.deployed().then(function(PausableTokenInstance) {
      return PausableTokenInstance.unpause();

    }).then(function(result){
      console.log(result);
    }).catch(function(err){
      console.log(err.message);
    });  
}

