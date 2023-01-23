// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/utils/Strings.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";


contract StakeNFT is ERC721URIStorage, Ownable {
    using SafeERC20 for IERC20;
    event Mint(address owner, uint256 tokenId, string tokenUri);
    event Buy(address owner, address buyer, uint256 tokenId, string tokenUri, uint256 price);
    event BuyWithERC20(address owner, address buyer, uint256 tokenId, string tokenUri, address erc20, uint256 price);
    event PutUpForSale(address owner, uint256 tokenId, string tokenUri, uint256 price);
    event PutUpForSaleWithERC20(address owner, uint256 tokenId, string tokenUri, address erc20, uint256 price);
    event WithdrawFromSale(address owner, uint256 tokenId, string tokenUri);
    event WithdrawBank(address to, uint256 amount);
    
    using Counters for Counters.Counter;
    struct SelledNFT {
        uint256 tokenId;
        string uri;
        address seller;
        uint256 price;
        address erc20;      // Если указано - продается за токены
    }

    Counters.Counter private _tokenIds;
    uint256 public MAX_SUPPLY = 8888;

    uint public version = 1;
    bool constant public isNFTStakeToken = true;
    bool private _allowTrade = true;
    bool private _allowMint = true;

    mapping(uint256 => bool) private _isTokensAtSale;
    mapping(uint256 => SelledNFT) private _tokensAtSale;

    mapping(address => bool) public allowedERC20forSale;

    bytes32 private _prevSeed = 0x0000000000000000000000000000000000000000000000000000000000000000;
    bytes32 private _prevRS   = 0x0000000000000000000000000000000000000000000000000000000000000000;

    string[] private _mintUris;
    uint256 private _mintPrice = 0;

    constructor(
        string memory __symbol,
        string memory __name,
        uint256 __maxSupply,
        uint256 __mintPrice,
        bool __allowTrade,
        bool __allowMint
    ) ERC721(__name, __symbol) {
        MAX_SUPPLY = __maxSupply;
        _mintPrice = __mintPrice;
        _allowTrade = __allowTrade;
        _allowMint = __allowMint;
    }

    function setERC20forTrade(address erc20, bool isAllowTrade) public onlyOwner {
        allowedERC20forSale[erc20] = isAllowTrade;
    }
    
    function setERC20forTradeMany(
        address[] memory erc20,
        bool[] memory isAllowTrade
    ) public onlyOwner {
        require(erc20.length > 0, "Empty list");
        require(erc20.length == isAllowTrade.length, "Length of ERC20 must be equal of isAllowTrade length");
        for (uint256 i = 0; i < erc20.length ; i++) {
            allowedERC20forSale[erc20[i]] = isAllowTrade[i];
        }
    }

    function bankAmount() public view returns(uint256) {
        return address(this).balance;
    }

    function withdrawBank() public onlyOwner {
        uint256 amount = address(this).balance;
        payable(msg.sender).transfer(amount);
        emit WithdrawBank(msg.sender, amount);
    }

    function setAllowMint(bool _newAllowMint) public onlyOwner {
        _allowMint = _newAllowMint;
    }

    function getAllowMint() public view returns (bool) {
        return _allowMint;
    }

    function setAllowTrade(bool _newAllowTrade) public onlyOwner {
        _allowTrade = _newAllowTrade;
    }

    function getAllowTrade() public view returns (bool) {
        return _allowTrade;
    }

    function setMintPrice(uint256 _newMintPrice) public onlyOwner {
        _mintPrice = _newMintPrice;
    }

    function getMintPrice() public view returns (uint256) {
        return _mintPrice;
    }

    function setMaxSupply(uint256 _newMaxSupply) public onlyOwner {
        MAX_SUPPLY = _newMaxSupply;
    }

    function getAllowance(address erc20) view private returns(uint256) {
        IERC20 token = IERC20(erc20);
        uint256 allowance = token.allowance(msg.sender,address(this));
        return allowance;
    }

    function flushRandom() public {
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            _prevSeed,
            _prevRS,
            blockhash(block.number),
            block.coinbase,
            block.difficulty,
            block.gaslimit,
            tx.gasprice,
            _tokenIds.current(),
            msg.sender,
            _mintUris.length,
            gasleft()
        )));
        _prevRS = bytes32(randomness);
    }
    function getRandom(bytes32 _seed, uint256 maxValue) private returns (uint256){
        uint256 randomnessL1 = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            _seed,
            _prevSeed,
            _prevRS,
            blockhash(block.number),
            block.coinbase,
            block.difficulty,
            block.gaslimit,
            tx.gasprice,
            _tokenIds.current(),
            msg.sender,
            _mintUris.length,
            gasleft()
        )));

        _prevSeed = _seed;
        _prevRS = bytes32(randomnessL1);
        uint256 rand = randomnessL1 % maxValue;
        return rand;
    }
    
    function getMintUris() public view returns (string[] memory) {
        return _mintUris;
    }

    function setMintUris(string[] memory newMintUris) public onlyOwner {
        _mintUris = newMintUris;
    }

    function _clearSellToken(uint256 _tokenId) private {
        _tokensAtSale[_tokenId] = SelledNFT(0, "", address(0), 0, address(0));
    }

    function maxSupply()
        external
        view
        returns (uint256)
    {
        return MAX_SUPPLY;
    }

    function totalSupply()
        external
        view
        returns (uint256)
    {
        return _tokenIds.current();
    }

    function fixTotalSupploy()
        private
    {
        if (_tokenIds.current() >= MAX_SUPPLY) MAX_SUPPLY = _tokenIds.current() + 1;
    }

    function getTokensAtSell()
        external view
        returns (SelledNFT[] memory ret)
    {
        uint256 _counter = 0;
        for (uint256 _tokenId = 0; _tokenId < MAX_SUPPLY; _tokenId++) {
            if (_isTokensAtSale[_tokenId]) {
                _counter++;
            }
        }
        
        SelledNFT[] memory _ret = new SelledNFT[](_counter);
        _counter = 0;

        for (uint256 _tokenId = 0; _tokenId < MAX_SUPPLY; _tokenId++) {
            if (_isTokensAtSale[_tokenId]) {
                SelledNFT memory _pushItem = SelledNFT(
                    _tokenId,
                    _tokensAtSale[_tokenId].uri,
                    _tokensAtSale[_tokenId].seller,
                    _tokensAtSale[_tokenId].price,
                    _tokensAtSale[_tokenId].erc20
                );
                _ret[_counter] = _pushItem;
                _counter++;
            }
        }

        return _ret;
    }

    function buyNFTbyERC20(uint _tokenId)
        public
    {
        require(_allowTrade == true, "Trade not allowed");
        require(address(this) == ownerOf(_tokenId), "This NFT not at sale board");
        require(_isTokensAtSale[_tokenId] == true, "This NFT is not for sale");
        require(_tokensAtSale[_tokenId].erc20 != address(0), "This token selled by Native coin");

        IERC20 payToken = IERC20(_tokensAtSale[_tokenId].erc20);
        uint256 buyerBalance = payToken.balanceOf(msg.sender);
        require(buyerBalance >= _tokensAtSale[_tokenId].price, "You do not have enough tokens on your balance to pay");
        uint256 buyerAllowance = payToken.allowance(msg.sender, address(this));
        require(buyerAllowance >= _tokensAtSale[_tokenId].price, "You did not allow the contract to send the purchase amount");
        

        payToken.safeTransferFrom(
            address(msg.sender),
            address(_tokensAtSale[_tokenId].seller),
            _tokensAtSale[_tokenId].price
        );
        _transfer(address(this), msg.sender, _tokenId);
        _isTokensAtSale[_tokenId] = false;
        
        emit BuyWithERC20(_tokensAtSale[_tokenId].seller, msg.sender, _tokenId, _tokensAtSale[_tokenId].uri, _tokensAtSale[_tokenId].erc20, _tokensAtSale[_tokenId].price);

        _clearSellToken(_tokenId);
    }


    function buyNFT(uint256 _tokenId)
        public
        payable
    {
        // check - trade allow
        require(_allowTrade == true, "Trade not allowed");
        // check - token on contract
        require(address(this) == ownerOf(_tokenId), "This NFT not at sale board");
        // check - token is on sale
        require(_isTokensAtSale[_tokenId] == true, "This NFT is not for sale");
        // check - price
        require(msg.value >= _tokensAtSale[_tokenId].price, "You have not paid enough for this item");
        // check this is not sell by ERC20
        require(_tokensAtSale[_tokenId].erc20 == address(0), "This token selled by ERC20");
        

        payable(_tokensAtSale[_tokenId].seller).transfer(msg.value);
        _transfer(address(this), msg.sender, _tokenId);
        _isTokensAtSale[_tokenId] = false;

        emit Buy(_tokensAtSale[_tokenId].seller, msg.sender, _tokenId, _tokensAtSale[_tokenId].uri, _tokensAtSale[_tokenId].price);

        _clearSellToken(_tokenId);
    }

    function sellNFTforERC20(
        uint256 _tokenId,
        address _erc20,
        uint256 price
    )
        public
    {
        require(_allowTrade == true, "Trade not allowed");
        require(msg.sender == ownerOf(_tokenId), "This is not your NFT");
        require(price > 0, "Price must be greater than zero");
        require(allowedERC20forSale[_erc20] == true, "This ERC20 not allowed as a trading currency");

        _isTokensAtSale[_tokenId] = true;
        _tokensAtSale[_tokenId] = SelledNFT(
            _tokenId,
            tokenURI(_tokenId),
            msg.sender,
            price,
            _erc20
        );
        _transfer(msg.sender, address(this), _tokenId);

        emit PutUpForSaleWithERC20(msg.sender, _tokenId, _tokensAtSale[_tokenId].uri, _erc20, price);
    }

    function sellNFT(
        uint256 _tokenId,
        uint256 price
    ) 
        public
    {
        require(_allowTrade == true, "Trade not allowed");
        require(msg.sender == ownerOf(_tokenId), "This is not your NFT");
        require(price > 0, "Price must be great than zero");

        _isTokensAtSale[_tokenId] = true;
        _tokensAtSale[_tokenId] = SelledNFT(
            _tokenId,
            tokenURI(_tokenId),
            msg.sender,
            price,
            address(0)
        );
        _transfer(msg.sender, address(this), _tokenId);

        emit PutUpForSale(msg.sender, _tokenId, _tokensAtSale[_tokenId].uri, price);
    }

    function deSellNFT(uint256 _tokenId) public {
        if(msg.sender != owner()) {
            require(msg.sender == _tokensAtSale[_tokenId].seller, "This is not your NFT");
        }

        _isTokensAtSale[_tokenId] = false;
    
        emit WithdrawFromSale(msg.sender, _tokenId, _tokensAtSale[_tokenId].uri);

        _clearSellToken(_tokenId);
        _transfer(address(this), msg.sender, _tokenId);
    }

    function mintRandom(bytes32 _seed)
        public
        payable
        returns (uint256)
    {
        require(_allowMint == true, "Mint not allowed");
        require(_mintUris.length > 0, "Random mint not configured");
        require(_mintPrice > 0, "Mint price not configured");
        require(msg.value >= _mintPrice, "You have not paid enough for mint");

        uint256 _randUri = getRandom(_seed, _mintUris.length);

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, _mintUris[_randUri]);

        fixTotalSupploy();
        emit Mint(msg.sender, newItemId, tokenURI(newItemId));
        return newItemId;
    }

    function mintNFTForSellMany(
        string[] memory tokenURIs,
        address[] memory erc20,
        uint256[] memory prices,
        address seller
    )
        public onlyOwner
        returns (uint256[] memory)
    {
        require((tokenURIs.length == erc20.length) && (erc20.length == prices.length), "URIs length, ERC20 length and Prices length not equal");

        for (uint256 i = 0; i < prices.length; i++) {
            require( prices[i] > 0, string.concat("Price must be great than zero. Price index #", Strings.toString(i)) );
        }
        uint256[] memory ret = new uint256[](tokenURIs.length);
        address tokenOwner = (seller == address(0)) ? owner() : seller;

        for (uint256 i = 0; i < prices.length; i++) {
            _tokenIds.increment();

            uint256 newItemId = _tokenIds.current();
            _mint(address(this), newItemId);
            _setTokenURI(newItemId, tokenURIs[i]);
            _isTokensAtSale[newItemId] = true;

            _tokensAtSale[newItemId] = SelledNFT(
                newItemId,
                tokenURIs[i],
                tokenOwner,
                prices[i],
                erc20[i]
            );

            emit Mint(tokenOwner, newItemId, tokenURIs[i]);
            if (erc20[i] == address(0)) {
                emit PutUpForSale(tokenOwner, newItemId, tokenURIs[i], prices[i]);
            } else {
                emit PutUpForSaleWithERC20(tokenOwner, newItemId, tokenURIs[i], erc20[i], prices[i]);
            }
            ret[i] = newItemId;
        }
        fixTotalSupploy();
        return ret;
    }

    function mintNFTForSell(
        string memory tokenURI,
        address erc20,
        uint256 price,
        address seller
    ) 
        public onlyOwner
        returns (uint256)
    {
        require(price > 0, "Price must be great than zero");
        require(allowedERC20forSale[erc20] == true, "This ERC20 not allow for trade");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(address(this), newItemId);
        _setTokenURI(newItemId, tokenURI);
        _isTokensAtSale[newItemId] = true;
        
        address tokenOwner = (seller == address(0)) ? owner() : seller;

        _tokensAtSale[newItemId] = SelledNFT(
            newItemId,
            tokenURI,
            tokenOwner,
            price,
            erc20
        );

        fixTotalSupploy();
        emit Mint(tokenOwner, newItemId, tokenURI);
        if (erc20 == address(0)) {
            emit PutUpForSale(tokenOwner, newItemId, tokenURI, price);
        } else {
            emit PutUpForSaleWithERC20(tokenOwner, newItemId, tokenURI, erc20, price);
        }
        return newItemId;
    }

    function mintNFT(address recipient, string memory tokenURI)
        public onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        fixTotalSupploy();
        emit Mint(recipient, newItemId, tokenURI);
        return newItemId;
    }
}
