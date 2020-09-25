/*
*	How to use this script
*   Run this command line as below
*		truffle exec scripts/getLockUpTime.js [--network <name>]
*/

var Lockup = artifacts.require("./Lockup.sol");
module.exports = function(callback) {
  

	Lockup.deployed().then(function(LockupInstance){

		return LockupInstance.getLockup();

	}).then(function(lock_time){
		//console.log(lock_time);
        var lockup_timestamp = lock_time.toString(10);
        var timestamp = new Date(parseInt(lockup_timestamp)*1000);
        var year = timestamp.getFullYear();
        var month = timestamp.getMonth() + 1;
        var date = timestamp.getDate();
        var hour = timestamp.getHours();
        var min = timestamp.getMinutes();
        var sec = timestamp.getSeconds();
        var time = year + '/' + month + '/' +  date + ' ' + hour + ':' + min + ':' + sec ;
        console.log(time);

	}).catch(function(err) {
		console.log(err.message);
	});
}