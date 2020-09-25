var COTCoinCrowdsale = artifacts.require("./COTCoinCrowdsale.sol");
var Discount = artifacts.require("./Discount.sol");
var WhiteList = artifacts.require("./WhiteList.sol");
var PausableToken = artifacts.require("./PausableToken.sol");
var Lockup = artifacts.require("./Lockup.sol");
var OwnerAddressInfo = artifacts.require("./OwnerAddressInfo.sol");

module.exports = function(deployer, network, accounts){

	var current_time = (new Date()).getTime();
	current_time = parseInt(current_time/1000);

    var premiumSale_startTime = (new Date('2018/03/15 00:00:00')).getTime(); //3/15 premium start
    premiumSale_startTime = parseInt(premiumSale_startTime/1000);
    premiumSale_startTime = premiumSale_startTime + 17*60*60; //18時
    premiumSale_startTime = premiumSale_startTime + 30*60;

    var premiumSale_endTime = (new Date('2018/03/20 00:00:00')).getTime(); //3/20 premium end
    premiumSale_endTime = parseInt(premiumSale_endTime/1000);
    premiumSale_endTime = premiumSale_endTime + 23*60*60; //23時
    premiumSale_endTime = premiumSale_endTime + 59*60; // 59分

    var preSale_startTime = (new Date('2018/03/21 00:00:00')).getTime(); //3/21 private start
    preSale_startTime = parseInt(preSale_startTime/1000);
    preSale_startTime = preSale_startTime + 12*60*60; //12時

    var preSale_endTime = (new Date('2018/04/14 00:00:00')).getTime(); //4/14 private end
    preSale_endTime = parseInt(preSale_endTime/1000);
    preSale_endTime = preSale_endTime + 23*60*60; //23時
    preSale_endTime = preSale_endTime + 59*60; // 59分

    var publicSale_startTime = (new Date('2018/04/15 00:00:00')).getTime(); //4/15 public start
    publicSale_startTime = parseInt(publicSale_startTime/1000);　
    publicSale_startTime = publicSale_startTime + 12*60*60; 　//12時

    var publicSale_endTime = (new Date('2020/04/14 00:00:00')).getTime(); //2020/4/14 public end
    publicSale_endTime = parseInt(publicSale_endTime/1000);
    publicSale_endTime = publicSale_endTime + 23*60*60; //23時
    publicSale_endTime = publicSale_endTime + 59*60; // 59分

    var token_lock_up_releaseTime = (new Date('2018/03/31 00:00:00')).getTime();
    token_lock_up_releaseTime = parseInt(token_lock_up_releaseTime/1000);
    token_lock_up_releaseTime = token_lock_up_releaseTime + 23*60*60; //23時
    token_lock_up_releaseTime = token_lock_up_releaseTime + 59*60; // 59分 end

    //取引レート
    //1 ETH = 10000 COT
    const rate = new web3.BigNumber(10000);　
    const saleToken_wallet = "0x25B94A458d19C97c7bE62D1c2653669BCCBb3e34"; //デプロイ用なアドレス設定
    const unsaleToken_wallet = "0xCD16C17de250dB7B30188a8fE07d276000E9ba93"; //デプロイ用なアドレス設定


	const lowest_weiAmount = 25*10**18;//プレセールに最低限ETH

	deployer.deploy(OwnerAddressInfo, saleToken_wallet, unsaleToken_wallet);
	deployer.deploy(Discount);
	deployer.link(Discount, COTCoinCrowdsale);
	deployer.deploy(WhiteList).then(function(WhiteList_result){

		return deployer.deploy(PausableToken);

	}).then(function(PausableToken_result) {

		return deployer.deploy(Lockup, token_lock_up_releaseTime);

	}).then(function(Lockup_result) {

		return deployer.deploy(COTCoinCrowdsale, 
			premiumSale_startTime, premiumSale_endTime, 
			preSale_startTime, preSale_endTime, 
			publicSale_startTime, publicSale_endTime, 
			rate, lowest_weiAmount, 
			saleToken_wallet, unsaleToken_wallet,
			WhiteList.address, PausableToken.address, 
			Lockup.address);

	}).then(function() { });

};
