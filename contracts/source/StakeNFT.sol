// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract StakeNFT is ERC721URIStorage, Ownable {
    event Mint(address owner, uint256 tokenId, string tokenUri);
    event Buy(address owner, address buyer, uint256 tokenId, string tokenUri, uint256 price);
    event PutUpForSale(address owner, uint256 tokenId, string tokenUri, uint256 price);
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

    bytes32 _prevSeed = 0x0000000000000000000000000000000000000000000000000000000000000000;
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

    function getRandom(bytes32 _seed, uint256 maxValue) private returns (uint256){
        uint256 randomness = uint(keccak256(abi.encodePacked(
            block.timestamp,
            _seed,
            _prevSeed,
            blockhash(block.number),
            block.coinbase,
            block.difficulty,
            block.gaslimit,
            tx.gasprice,
            _tokenIds.current(),
            _mintUris.length
        )));
        _prevSeed = _seed;
        uint256 rand = randomness % maxValue;
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

    /*
    function buyNFTbyERC20(uint _tokenId)
        public
        pure
    {
        require(1 == 2, "Not implemented");
    }
    */

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
        
        
        _transfer(address(this), msg.sender, _tokenId);
        _isTokensAtSale[_tokenId] = false;
        

        payable(_tokensAtSale[_tokenId].seller).transfer(msg.value);
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

        _isTokensAtSale[_tokenId] = true;
        _tokensAtSale[_tokenId] = SelledNFT(
            _tokenId,
            tokenURI(_tokenId),
            msg.sender,
            price,
            _erc20
        );
        _transfer(msg.sender, address(this), _tokenId);
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
        require(msg.sender == _tokensAtSale[_tokenId].seller, "This is not your NFT");

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

    function mintNFTForSell(
        string memory tokenURI,
        uint256 price,
        address seller
    ) 
        public onlyOwner
        returns (uint256)
    {
        require(price > 0, "Price must be great than zero");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(address(this), newItemId);
        _setTokenURI(newItemId, tokenURI);
        _isTokensAtSale[newItemId] = true;
        
        address tokenOwner = (seller == address(0)) ? address(this) : seller;

        _tokensAtSale[newItemId] = SelledNFT(
            newItemId,
            tokenURI,
            tokenOwner,
            price,
            address(0)
        );

        fixTotalSupploy();
        emit Mint(tokenOwner, newItemId, tokenURI);
        emit PutUpForSale(tokenOwner, newItemId, tokenURI, price);
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
