pragma solidity ^0.4.18;


/**
 * @title OwnerAddressInfo
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract OwnerAddressInfo {

	address public saleToken_wallet;
	address public unsaleToken_wallet;

	function OwnerAddressInfo(address _saleToken_wallet, address _unsaleToken_wallet)public{

		saleToken_wallet = _saleToken_wallet; 

		unsaleToken_wallet = _unsaleToken_wallet;
	}

	/**
	* @dev get sale token owner address
	*/
	function getSaleAddress()public view returns (address){
		return saleToken_wallet;
	}	

	/**
	* @dev get unsale token owner address
	*/
	function getUnsaleAddress()public view returns (address){
		return unsaleToken_wallet;
	}

}
