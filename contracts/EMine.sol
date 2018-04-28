pragma solidity ^0.4.18;
import "./EMineRewardToken.sol";
import "./EMineLifecycleToken.sol";
import "./RewardOracle.sol";
import "zeppelin-solidity/contracts/ownership/Ownable.sol";


contract EMine is Ownable {

    event ProductReturned(uint256 _tokenID);
    event ProductRecycled (uint256 _tokenID);

    enum  UserType { NotSet, Manufacturer, Shop, Recycler }
    mapping(address => UserType) public userType;

    mapping(address => uint256[]) public products;

    EMineRewardToken public rewardToken;
    EMineLifecycleToken public lifecycleToken;
    RewardOracle public rewardOracle;

    function setRewardOracle(RewardOracle _rewardOracle){
        rewardOracle = _rewardOracle;
    }

    function EMine(EMineRewardToken _rewardToken, EMineLifecycleToken _lifecycleToken, RewardOracle _rewardOracle) public {
        rewardToken = _rewardToken;
        lifecycleToken = _lifecycleToken;
        rewardOracle = _rewardOracle;
    }

    modifier onlyShop() {
        require (UserType.Shop == userType[msg.sender]);
        _;
    }

    modifier onlyManufacturer() {
        require (UserType.Manufacturer == userType[msg.sender]);
        _;
    }

    modifier onlyRecycler() {
        require (UserType.Recycler == userType[msg.sender]);
        _;
    }


    function addShop(address _shopAddress) public onlyOwner {
        require(_shopAddress != msg.sender);
        require (UserType.NotSet == userType[_shopAddress]);
        userType[_shopAddress] = UserType.Shop;
    }

    function addManufacturer (address _manufacturerAddress) public onlyOwner {
        require(_manufacturerAddress != msg.sender);
        require (UserType.NotSet == userType[_manufacturerAddress]);
        userType[_manufacturerAddress] = UserType.Manufacturer;
    }

    function addRecycler (address _recyclerAddress) public onlyOwner {
        require(_recyclerAddress != msg.sender);
        require (UserType.NotSet == userType[_recyclerAddress]);
        userType[_recyclerAddress] = UserType.Recycler;
    }

    function createProduct (string metadataURI) public onlyManufacturer {
        lifecycleToken.mintToken(msg.sender, metadataURI);
    }

    function returnProduct ( uint256 _tokenID, address _returnerId ) onlyShop {
        require (lifecycleToken.tokenState(_tokenID) == EMineLifecycleToken.ProductState.Available);

        lifecycleToken.setState(_tokenID, EMineLifecycleToken.ProductState.Returned );
        rewardOracle.rewardUserByToken(_tokenID, _returnerId, true );
        products[msg.sender].push(_tokenID);
        ProductReturned(_tokenID);
    }

    function recycleProduct ( uint256 _tokenID, address _recyclerId ) onlyRecycler {
        require (lifecycleToken.tokenState(_tokenID) != EMineLifecycleToken.ProductState.Recycled);

        rewardOracle.rewardUserByToken(_tokenID, _recyclerId, false );
        lifecycleToken.setState(_tokenID, EMineLifecycleToken.ProductState.Recycled );
        products[msg.sender].push(_tokenID);
        ProductRecycled(_tokenID);
    }

    function giveRewardToken (address _to, uint256  amount) public {
        require(msg.sender == address(rewardOracle));
        rewardToken.mint(_to, amount) ;
    }

    function getProductArrayLength (address _addr) public view returns (uint256){
        return products[_addr].length;
    }


}