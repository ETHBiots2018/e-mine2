pragma solidity ^0.4.18;
//import 'zeppelin-solidity/contracts/math/SafeMath.sol';
//import './ERC20Token';
import 'zeppelin-solidity/contracts/token/ERC20/StandardToken.sol';

contract EMineRewardToken is StandardToken {

    string public name = "EMineToken"; 
    string public symbol = "EMT";
    uint8 public decimals = 18;

    event Mint(address indexed to, uint256 amount);
    /**
    * @dev Function to mint tokens
    * @param _to The address that will receive the minted tokens.
    * @param _amount The amount of tokens to mint.
    * @return A boolean that indicates if the operation was successful.
    */
    function mint(address _to, uint256 _amount) public returns (bool) {
        totalSupply_ = totalSupply_.add(_amount);
        balances[_to] = balances[_to].add(_amount);
        Mint(_to, _amount);
        Transfer(address(0), _to, _amount);
        return true;
    }
}

