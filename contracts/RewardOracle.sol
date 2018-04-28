pragma solidity ^0.4.18;
import "./oraclizeAPI.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";
import "./EMine.sol";

//Right now, only returns a random value between 1 and 100, however it is meant to find the optimal reward by looking at ERC712 token metadata
//We have not implemented this since we do not have the domain knowledge to find the optimal tokens to be rewarded.
contract RewardOracle is usingOraclize, Ownable{

    EMine public EMineContract;

    event LogNewOraclizeQuery(string description);
    event NewRewardIssued(string rewardValue);
    event OracleFunded(uint256 value);

    mapping(bytes32 => uint256) public oracleIds;
    mapping(uint256 => address) public returnerAddress;
    mapping(uint256 => address) public recyclerAddress;

    mapping(address => uint256[]) public recyclerTokens;
    mapping(address => uint256[]) public returnerTokens;

    function rewardUserByToken (uint256 _tokenId, address _rewardAddress, bool isReturn ) payable{
        require(msg.sender == address(EMineContract));

        LogNewOraclizeQuery("Oraclize query was sent, standing by for the answer..");

        //Right now, only returns a random value between 1 and 100, however it is meant to find the optimal reward by looking at ERC712 token metadata
        //We have not implemented this since we do not have the domain knowledge to find the optimal tokens to be rewarded.
        bytes32 oraclizeId = oraclize_query("WolframAlpha", "random number between 1 and 100");
        oracleIds [oraclizeId] = _tokenId;

        if (isReturn) {
            returnerAddress [_tokenId] = _rewardAddress;
            returnerTokens[_rewardAddress].push(_tokenId);
        }

        else {
            recyclerAddress[_tokenId] = _rewardAddress;
            recyclerTokens[_rewardAddress].push(_tokenId);
        }
    }

    function __callback(bytes32 myid, string result) {
        if (msg.sender != oraclize_cbAddress()) throw;

        address rewardAddress = recyclerAddress[oracleIds[myid]];
        if (rewardAddress == 0) rewardAddress = returnerAddress[oracleIds[myid]];

        EMineContract.giveRewardToken(rewardAddress, parseInt(result));
        NewRewardIssued(result);
    }

    function setEMineContract (EMine _EMineContract) onlyOwner{
        EMineContract = _EMineContract;
    }

    function fundOracle() payable{
        OracleFunded(msg.value);
    }

    function getRecyclerArrayLength (address _addr) public view returns (uint256){
        return recyclerTokens[_addr].length;
    }

    function getReturnerArrayLength (address _addr) public view returns (uint256){
        return returnerTokens[_addr].length;
    }

}