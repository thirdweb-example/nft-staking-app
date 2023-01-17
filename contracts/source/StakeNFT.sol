// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";


contract StakeNFT is ERC721URIStorage, Ownable {
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
    bool constant public isManaged = true;

    mapping(uint256 => bool) private _isTokensAtSale;
    mapping(uint256 => SelledNFT) private _tokensAtSale;


    mapping(uint256 => bool) private _tokensAtRandMint;

    constructor(string memory _symbol, string memory _name, uint256 _max_supply) ERC721(_name, _symbol) {
        MAX_SUPPLY = _max_supply;
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
        pure
    {
        require(1 == 2, "Not implemented");
    }

    function buyNFT(uint256 _tokenId)
        public
        payable
    {
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
        _clearSellToken(_tokenId);
    }

    function sellNFTforERC20(
        uint256 _tokenId,
        address _erc20,
        uint256 price
    )
        public
    {
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
        require(msg.sender == ownerOf(_tokenId), "This is not your NFT");

        _isTokensAtSale[_tokenId] = true;
        _tokensAtSale[_tokenId] = SelledNFT(
            _tokenId,
            tokenURI(_tokenId),
            msg.sender,
            price,
            address(0)
        );
        _transfer(msg.sender, address(this), _tokenId);
    }

    function sellNFTbyERC20(
        uint256 _tokenId,
        address erc20,
        uint256 price
    ) public {
        require(msg.sender == ownerOf(_tokenId), "This is not your NFT");

        _isTokensAtSale[_tokenId] = true;
        _tokensAtSale[_tokenId] = SelledNFT(
            _tokenId,
            tokenURI(_tokenId),
            msg.sender,
            price,
            erc20
        );
        _transfer(msg.sender, address(this), _tokenId);
    }

    function deSellNFT(uint256 _tokenId) public {
        require(msg.sender == _tokensAtSale[_tokenId].seller, "This is not your NFT");

        _isTokensAtSale[_tokenId] = false;
        _clearSellToken(_tokenId);
        _transfer(address(this), msg.sender, _tokenId);
    }

    function mintNFTForSell(
        string memory tokenURI,
        uint256 price,
        address seller
    ) 
        public onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(address(this), newItemId);
        _setTokenURI(newItemId, tokenURI);
        _isTokensAtSale[newItemId] = true;
        _tokensAtSale[newItemId] = SelledNFT(
            newItemId,
            tokenURI,
            (seller == address(0)) ? address(this) : seller,
            price,
            address(0)
        );

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

        return newItemId;
    }
}
