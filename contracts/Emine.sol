pragma solidity ^0.4.18;
import "./EMineRewardToken.sol";

contract Owned {

    address public owner;

    function Owned() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(owner == msg.sender);
        _;
    }
}

//TODO: replace with ERC20
interface token {
    function transfer(address _to, uint256 _value) external returns (bool);
    function mint(address _to, uint256 _amount) external returns (bool);
    function balanceOf(address _owner) external constant returns (uint256 balance);
}

contract EMine is Owned {
    
    address public shopAddress;
    address public manufacturerAddress;
    address public recyclerAdress;
    
    event ProductSold( uint256 _tokenID);
    event ProductReturned(uint256 _tokenID);
    event ProductRecycled (uint256 _tokenID);
    
    enum  ProductState { Produced, Sold, Returned, Recycled }
    
    //TODO: chnge to track a device with a NFT (non-fungable) token as a tracker
    struct Product {
        ProductState state;
        string  productId;
        address manufacturer;
        address boughtByUser;
        address soldByShop;
        address recyclerShop;
        address returnerUser;
    }
    
    Product[] public products;
    token public rewardToken;

    function Emine(address addressOfRewardToken) public {
        rewardToken = token(addressOfRewardToken); 
    }
        
    modifier onlyShop() {
        //TODO: make registry for shops
        require (msg.sender == shopAddress);
        _;
    }
    
    modifier onlyManufacturer() {
        //TODO: check registry for manufactures
        require (msg.sender == manufacturerAddress);
        _;
    }
    
    modifier onlyRecycler() {
        require (msg.sender == recyclerAdress);
        _;
    }
    
    //TODO: make registry for shops
    function setShop(address _shopAddress) public onlyOwner {
        shopAddress = _shopAddress;
    }
    
    //TODO: make registry for manufactures
    function setManufacturer (address _manufacturerAddress) public onlyOwner {
        manufacturerAddress = _manufacturerAddress;
    }
    
    //TODO: use modifier for onlyManufacturers
    function createProduct (string manId) public {
        uint256 productId = products.length++;
        Product storage product = products[productId];
        product.state = ProductState.Produced;
        product.manufacturer = msg.sender;
        product.productId = manId;
    }

    //TODO: use modifier for onlyShops / not needed for the ecosystem
    function sellProduct ( uint256 _tokenID, address buyerAddress ) public {
        products[_tokenID].state = ProductState.Sold;
        products[_tokenID].boughtByUser = buyerAddress;
        products[_tokenID].soldByShop = msg.sender;
    }
    
    //TODO: make an oracle/event for verification
    function returnProduct ( uint256 _tokenID, address returnerUser) public {
        require(products[_tokenID].state == ProductState.Sold);
        products[_tokenID].state = ProductState.Returned;
        rewardToken.mint(returnerUser, 1);
        products[_tokenID].returnerUser = returnerUser;
    }
    
    function recycleProduct ( uint256 _tokenID, address recyclerShop) public {
        require(products[_tokenID].state == ProductState.Returned);
        products[_tokenID].state = ProductState.Recycled;
        rewardToken.mint(recyclerShop, 1);
        products[_tokenID].recyclerShop = recyclerShop;
    }
    
}