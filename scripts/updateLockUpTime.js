/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/updateLockUpTime.js [--network <name>] [--date=<2018/02/01>] [--time=<19:00:00>]
*/

//process.argv
var args = require('minimist')(process.argv.slice(2));

var date = '';
var time = '';

if(args['date'] == null){
	console.log('format error');
	process.exit(1);
}

date = args['date'];

if(args['time'] != null){
	time = args['time'];
}

var new_locktime = date + ' ' + time;
var timestamp = new Date(new_locktime).getTime();
if( isNaN(timestamp)){
	console.log('format error');
	process.exit(1);
}

timestamp = timestamp / 1000;

var Lockup = artifacts.require("./Lockup.sol");

module.exports = function(callback) {
    Lockup.deployed().then(function(LockupInstance) {

      return LockupInstance.updateLockup(timestamp);

    }).then(function(result){
      console.log(result);

    }).catch(function(err){
      console.log(err.message);
    });
}



