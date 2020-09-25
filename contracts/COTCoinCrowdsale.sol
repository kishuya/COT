pragma solidity ^0.4.18;

import './PausableToken.sol';
import './WhiteList.sol';
import './Discount.sol';
import './CrowdsaleWithLockUp.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';

contract COTCoinCrowdsale is CrowdsaleWithLockUp{
	using SafeMath for uint256;

	WhiteList public whiteList;

	PausableToken public pausable;

	//セール用な契約オーナーアドレス
	address public saleToken_owner;

	//セール以外用な契約オーナーアドレス
	address public unsaleToken_owner;


	uint256 public premiumSale_startTime;
	uint256 public premiumSale_endTime;
	uint256 public preSale_startTime;
	uint256 public preSale_endTime;
	uint256 public publicSale_startTime;
	uint256 public publicSale_endTime;

	//プレミアムセール期間とプレセール期間に、最低限送金ETH
	uint256 public lowest_weiAmount;

	function COTCoinCrowdsale(
		uint256 _premiumSale_startTime, uint256 _premiumSale_endTime, 
		uint256 _preSale_startTime, uint256 _preSale_endTime, 
		uint256 _publicSale_startTime, uint256 _publicSale_endTime, 
		uint256 _rate, uint256 _lowest_weiAmount, 
		address _saleToken_wallet, address _unsaleToken_wallet, 
		address _whiteList_address, address _pauable_address, 
		address _lockup_address) public
	    CrowdsaleWithLockUp(_premiumSale_startTime, _publicSale_endTime, _rate, _saleToken_wallet, _unsaleToken_wallet, _lockup_address)
	{
	    saleToken_owner = _saleToken_wallet;
	    unsaleToken_owner = _unsaleToken_wallet;
	    premiumSale_startTime = _premiumSale_startTime;
	    premiumSale_endTime = _premiumSale_endTime;
	    preSale_startTime = _preSale_startTime;
	    preSale_endTime = _preSale_endTime;
	    publicSale_startTime = _publicSale_startTime;
	    publicSale_endTime = _publicSale_endTime;
	    lowest_weiAmount = _lowest_weiAmount;
	    whiteList = WhiteList(_whiteList_address);
	    pausable = PausableToken(_pauable_address);
	}

	// overriding Crowdsale#buyTokens to　send token to buyer, and don't need to mint token
	// overriding Crowdsale#buyTokens,トークン上げる方法改修、新しいトークンミントじゃなくて、契約オーナーからトークンを上げる
	function buyTokens(address beneficiary) public payable {

		//check that the sale is paused or not
		//セール販売状況チェック
		require( pausable.ispause() == false );

		//only pre-salse period and public-sale period that can buy token
		//トークンを購入する期間はpre-saleとpublic-saleだけ
		require( ( (now >= premiumSale_startTime) && (now <= premiumSale_endTime) ) || ( (now >= preSale_startTime) && (now <= preSale_endTime) ) || ( (now >= publicSale_startTime) && (now <= publicSale_endTime) ) );

	    require(beneficiary != address(0));

	  	//owner can not buy token
	  	//オーナーはトークンを購入できないというルール設定
	    require(beneficiary != saleToken_owner);
	    require(beneficiary != unsaleToken_owner);

	    require(validPurchase());

	    uint256 weiAmount = msg.value;

	    //最低限0.0001個ETHを送金しなければなりません。
	    require( weiAmount >= 0.0001*10**18 );

	    uint256 tokens = weiAmount.mul(rate);
	    uint8 inWhitelist = whiteList.checkList(beneficiary);

	    //user should be in white list
	    //トークンを購入する場合に、white checkListをチェックしなければならない
	    //0:white listに入ってない, 1:プレセール, 2:パブリックセール, 3:プレミアムセール
	    require( inWhitelist != 0);

	    //プレミアム期間
	    if( (now >= premiumSale_startTime) && (now <= premiumSale_endTime) ){

	    	//user should be 3 in the whitelist when they want purchase token in premium-sale
			require( inWhitelist == 3 );

			//should be more than 25 eth
	    	require(weiAmount >= lowest_weiAmount);
	    	tokens = Discount.premiumSaleDiscount( weiAmount, tokens );
		}

		//プレセール期間
		if( (now >= preSale_startTime) && (now <= preSale_endTime) ){

			//user should be 1 in the whitelist when they want purchase token in pre-sale
	    	//or user should be 3 in the whitelist when they want purchase token in premium-sale
			require( (inWhitelist == 1) || (inWhitelist == 3) );

	    	//should be more than 25 eth
	    	require(weiAmount >= lowest_weiAmount);		
	    	tokens = Discount.preSaleDiscount( weiAmount, tokens );	
		}

	    //小数点切り捨てる
	    //e.q. if token is 45.01, then it will become 45.
	    tokens = tokens/10**18;
		tokens = tokens*10**18;

	    // update state
	    weiRaised = weiRaised.add(weiAmount);

	    require(token.sellToken( beneficiary, tokens));

	    TokenPurchase(msg.sender, beneficiary, weiAmount, tokens);

	    forwardFunds();
	}	
}
