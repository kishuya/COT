pragma solidity ^0.4.18;

import './Lockup.sol';
import 'zeppelin-solidity/contracts/math/SafeMath.sol';
import "zeppelin-solidity/contracts/token/MintableToken.sol";

contract COTCoin is MintableToken{
	using SafeMath for uint256;

	Lockup public lockup;

	string public constant name = 'CosplayToken';
	string public constant symbol = 'COT';
	uint8 public constant decimals = 18;

	//the default total tokens
	//契約オーナー最初持っているトークン量、トークン最大発行量-10億個、default:1000000000
	uint256 public constant _totalSupply = (10**9)*10**18; 

	address public _saleToken_owner;
	address public _unsaleToken_owner;


	function COTCoin(address _saleToken_wallet, address _unsaleToken_wallet, address _lockUp_address)public{

		lockup = Lockup(_lockUp_address);
		
		_saleToken_owner = _saleToken_wallet; 

		_unsaleToken_owner = _unsaleToken_wallet;

	    //40％量COTはセール期間に用
	    uint256 _remainingSaleSupply = (_totalSupply*40/100);

		//send all of token to owner in the begining.
		//最初的に、契約生成するときに40%トークンは契約オーナーに上げる
		require(mint(_saleToken_wallet, _remainingSaleSupply));

		//最初的に、契約生成するときに60%トークンは契約オーナーに上げる
		require(mint(_unsaleToken_wallet, (_totalSupply-_remainingSaleSupply)));

		//これ以上トークンを新規発行できないようにする。
		finishMinting();

	}

  	/**
	* @dev Function to sell token to other user
	* @param _to The address that will receive the tokens.
	* @param _value The token amount that token holding owner want to give user
	* @return A uint256 that indicates if the operation was successful.
	*/
	function sellToken(address _to, uint256 _value)onlyOwner public returns (bool) {

		require(_to != address(0));

		require(_to != _saleToken_owner);

		require(balances[_saleToken_owner] > 0);

		require(_value <= balances[_saleToken_owner]);

		// SafeMath.sub will throw if there is not enough balance.

		//minus the holding tokens from owner
		balances[_saleToken_owner] = balances[_saleToken_owner].sub(_value);

		//plus the holding tokens to buyer
		//トークンを購入したいユーザーはトークンをプラス
		balances[_to] = balances[_to].add(_value);

		Transfer(address(0), _to , _value);
		return true;
	}

	/**
	* @dev transfer token for a specified address
	* @param _to The address to transfer to.
	* @param _value The amount to be transferred.
	// override this method to check token lockup time.
	*/
	function transfer(address _to, uint256 _value) public returns (bool) {
		require(_to != address(0));
		require(_value <= balances[msg.sender]);

		//オーナー以外の人たちはトークン交換できる解放時間後で、交換できます
		if( ( msg.sender != _saleToken_owner ) && ( msg.sender != _unsaleToken_owner ) ){
			require(lockup.isLockup());
		}

		// SafeMath.sub will throw if there is not enough balance.
		balances[msg.sender] = balances[msg.sender].sub(_value);
		balances[_to] = balances[_to].add(_value);
		Transfer(msg.sender, _to, _value);

		return true;
	}
	
}

