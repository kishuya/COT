pragma solidity ^0.4.18;


import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import 'zeppelin-solidity/contracts/lifecycle/Pausable.sol';

/**
 * @title PausableToken
 * @dev Base contract which allows children to implement an emergency stop mechanism.
 */
contract PausableToken is Pausable {

  /**
  * @dev called for get status of pause.
  */
  function ispause() public view returns(bool){
    return paused;
  }

}
