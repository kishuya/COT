pragma solidity ^0.4.18;
import 'zeppelin-solidity/contracts/ownership/Ownable.sol';

contract WhiteList is Ownable{


	mapping(address => uint8) public whitelist;

  	/**
	* @dev Function to import user's address into whitelist, only user who in the whitelist can purchase token when pre sale.
	*      Whitelistにユーザーアドレスを記録。sale期間に、Whitelistに記録したユーザーたちしかトークンを購入できない
	* @param _users The address list that can purchase token when sale period.
	* @param _flag The flag for record different lv user, 1: pre sale user, 2: public sale user, 3: JP premium user.
	* @return A bool that indicates if the operation was successful.
	*/
	function importList(address[] _users, uint8 _flag) onlyOwner public returns(bool){

		require(_users.length > 0);

        for(uint i = 0; i < _users.length; i++) {
            whitelist[_users[i]] = _flag;
        }		
		return true;
	}

  	/**
	* @dev Function check the current user can purchase token or not.
	*      ユーザーアドレスはWhitelistに記録かどうかチェック
	* @param _user The user address that can purchase token or not when public salse.
	* @return A bool that indicates if the operation was successful.
	*/
	function checkList(address _user)public view returns(uint8){
		return whitelist[_user];
	}
}