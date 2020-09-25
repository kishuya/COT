pragma solidity ^0.4.18;


import "zeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * @title Lockup
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract Lockup is Ownable {

	uint256 public lockup_time;

	function Lockup(uint256 _lockUp_release_time)public{

		lockup_time = _lockUp_release_time; 
	}


	/**
	* @dev Function to check token is locked or not
	* @return A bool that indicates if the operation was successful.
	*/
	function isLockup() public view returns(bool){
		return (now >= lockup_time);
	}

	/**
	* @dev Function to get token lockup time
	* @return A uint256 that indicates if the operation was successful.
	*/
	function getLockup()public view returns (uint256) {
		return lockup_time;
	}

	/**
	* @dev Function to update token lockup time
	* @return A bool that indicates if the operation was successful.
	*/
	function updateLockup(uint256 _newLockUpTime) onlyOwner public returns(bool){

		require( _newLockUpTime > now );

		lockup_time = _newLockUpTime;

		return true;
	}
}
