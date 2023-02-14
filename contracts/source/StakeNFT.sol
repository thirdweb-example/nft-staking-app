// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/utils/Counters.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/access/Ownable.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/utils/Strings.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/contracts/utils/math/SafeMath.sol";


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
    bool private _allowUserSale = true;
    uint private _tradeFee = 0;
    bool private _allowMint = true;
    bool private _allowOwnMint = true;


    mapping(uint256 => bool) private _isTokensAtSale;
    mapping(uint256 => SelledNFT) private _tokensAtSale;

    mapping(address => bool) private _blackList;

    address[] private _allowedERC20;

    bytes32 private _prevSeed = 0x0000000000000000000000000000000000000000000000000000000000000000;
    bytes32 private _curRS    = 0x0000000000000000000000000000000000000000000000000000000000000000;
    bytes32 private _prevRS   = 0x0000000000000000000000000000000000000000000000000000000000000000;

    string[] private _mintUris;
    uint256 private _mintPrice = 0;

    uint256 private _ownMintPrice = 0;

    constructor(
        string memory __symbol,
        string memory __name,
        uint256 __maxSupply,
        uint256 __mintPrice,
        uint256 __ownMintPrice,
        bool __allowTrade,
        bool __allowUserSale,
        uint __tradeFee,
        bool __allowMint,
        bool __allowOwnMint,
        address[] memory __allowedERC20
    ) ERC721(__name, __symbol) {
        MAX_SUPPLY = __maxSupply;
        _mintPrice = __mintPrice;
        _allowTrade = __allowTrade;
        _allowUserSale = __allowUserSale;
        _tradeFee = __tradeFee;
        _allowMint = __allowMint;
        _allowOwnMint = __allowOwnMint;
        _ownMintPrice = __ownMintPrice;
        _allowedERC20 = __allowedERC20;
    }

    function addBlackList(address user) public onlyOwner {
        _blackList[user] = true;
    }
    function removeBlackList(address user) public onlyOwner {
        _blackList[user] = false;
    }

    function isBlacklisted(address user) public view returns(bool) {
        return _blackList[user];
    }

    function setNewOptions(
        bool __allowTrade,
        bool __allowUserSale,
        uint __tradeFee,
        bool __allowMint,
        uint256 __mintPrice,
        bool __allowOwnMint,
        uint256 __ownMintPrice,

        address[] memory __allowedERC20
    ) public onlyOwner {
        _mintPrice = __mintPrice;
        _ownMintPrice = __ownMintPrice;
        _allowOwnMint = __allowOwnMint;    
        _allowTrade = __allowTrade;
        _allowUserSale = __allowUserSale;
        _tradeFee = __tradeFee;
        _allowMint = __allowMint;
        _allowedERC20 = __allowedERC20;
    }

    function setAllowedERC20(address[] memory newAllowedERC20) public onlyOwner {
        _allowedERC20 = newAllowedERC20;
    }
    function getAllowedERC20() public view returns(address[] memory) {
        return _allowedERC20;
    }
    function isAllowedERC20(address erc20) public view returns (bool) {
        for(uint i=0; i<_allowedERC20.length;i++) {
            if (erc20 == _allowedERC20[i]) return true;
        }
        return false;
    }

    function bankAmount() public view returns(uint256) {
        return address(this).balance;
    }

    function withdrawBank() public onlyOwner {
        uint256 amount = address(this).balance;
        payable(msg.sender).transfer(amount);
        emit WithdrawBank(msg.sender, amount);
    }

    function bankAmountERC20(address erc20) public view returns(uint256) {
        IERC20 token = IERC20(erc20);
        return token.balanceOf(address(this));
    }
    function withdrawBankERC20(address erc20) public onlyOwner {
        IERC20 token = IERC20(erc20);
        uint256 balance = token.balanceOf(address(this));
        token.transfer(owner(), balance);
    }

    function setAllowMint(bool _newAllowMint) public onlyOwner {
        _allowMint = _newAllowMint;
    }

    function getAllowMint() public view returns (bool) {
        return _allowMint;
    }

    function setAllowMintOwn(bool _newValue) public onlyOwner {
        _allowOwnMint = _newValue;
    }

    function getAllowMintOur() public view returns (bool) {
        return _allowOwnMint;
    }

    function setAllowUserSale(bool _newAllowUserSale) public onlyOwner {
        _allowUserSale = _newAllowUserSale;
    }

    function getAllowUserSale() public view returns (bool) {
        return _allowUserSale;
    }

    function getTradeFee() public view returns (uint) {
        return _tradeFee;
    }
    
    function setTradeFee(uint _newTradeFee) public onlyOwner {
        _tradeFee = _newTradeFee;
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

    function setMintOwnPrice(uint256 _newValue) public onlyOwner {
        _ownMintPrice = _newValue;
    }
    
    function getMintOwnPrice() public view returns (uint256) {
        return _ownMintPrice;
    }

    function setMaxSupply(uint256 _newMaxSupply) public onlyOwner {
        MAX_SUPPLY = _newMaxSupply;
    }

    function getAllowance(address erc20) view private returns(uint256) {
        IERC20 token = IERC20(erc20);
        uint256 allowance = token.allowance(msg.sender,address(this));
        return allowance;
    }

    /*
        Нужно вызвать один раз и переодически вызывать для генерации внутренего сида
        _prevRS, _curRS приватный, не доступен из вне
        Обычный человек, не имеющий под контролем подавляющее число валидаторов (майнеров) не может угадать
        сколько в момент этой транзакции было в?:
            _prevSeed
            _prevRS
            _curRS
            _tokenIds.current()
            _mintUris.length
    */
    function flushRandom(bytes32 _flushSeed) public onlyOwner {
        uint256 randomness = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            _prevSeed,
            _prevRS,
            _curRS,
            _flushSeed,
            _tokenIds.current(),
            _mintUris.length
        )));
        _prevRS = _curRS;
        _curRS = bytes32(randomness);
    }

    function getRandom(bytes32 _seed, uint256 maxValue) private returns (uint256){
        uint256 randomnessL1 = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            _seed,
            _prevSeed,
            _curRS,
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

    function fixTotalSupply()
        private
    {
        if (_tokenIds.current() >= MAX_SUPPLY) MAX_SUPPLY = _tokenIds.current() + 1;
    }

    function getMyTokensAtSale() external view returns (SelledNFT[] memory ret) {
        return getUserTokensAtSale(msg.sender);
    }

    function getUserTokensAtSale(address seller)
        public view
        returns (SelledNFT[] memory ret)
    {
        uint256 _counter = 0;
        for (uint256 _tokenId = 0; _tokenId < MAX_SUPPLY; _tokenId++) {
            if (_isTokensAtSale[_tokenId] && _tokensAtSale[_tokenId].seller == seller) {
                _counter++;
            }
        }
        
        SelledNFT[] memory _ret = new SelledNFT[](_counter);
        _counter = 0;

        for (uint256 _tokenId = 0; _tokenId < MAX_SUPPLY; _tokenId++) {
            if (_isTokensAtSale[_tokenId] && _tokensAtSale[_tokenId].seller == seller) {
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

    function getTokensAtSale()
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
        

        uint256 amount = _tokensAtSale[_tokenId].price;
        uint256 feeAmount = SafeMath.mul(SafeMath.div(amount, 100), _tradeFee);
        if (_tokensAtSale[_tokenId].seller == owner()) feeAmount = 0;
        uint256 amountWithFee = SafeMath.sub(amount, feeAmount);

        payToken.safeTransferFrom(
            address(msg.sender),
            address(_tokensAtSale[_tokenId].seller),
            amountWithFee
        );
        if (feeAmount > 0) {
            payToken.safeTransferFrom(
                address(msg.sender),
                address(owner()),
                feeAmount
            );
        }
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
        
        uint256 amount = msg.value;
        uint256 feeAmount = SafeMath.mul(SafeMath.div(amount, 100), _tradeFee);
        if (_tokensAtSale[_tokenId].seller == owner()) feeAmount = 0;
        uint256 amountWithFee = SafeMath.sub(amount, feeAmount);

        payable(_tokensAtSale[_tokenId].seller).transfer(amountWithFee);
        if (feeAmount > 0) {
            payable(owner()).transfer(feeAmount);
        }
        
        _transfer(address(this), msg.sender, _tokenId);
        _isTokensAtSale[_tokenId] = false;

        emit Buy(_tokensAtSale[_tokenId].seller, msg.sender, _tokenId, _tokensAtSale[_tokenId].uri, _tokensAtSale[_tokenId].price);

        _clearSellToken(_tokenId);
    }

    function sellNFT(
        uint256 _tokenId,
        uint256 price,
        address _erc20
    )
        public
    {
        require(_allowTrade == true, "Trade not allowed");
        require(_allowUserSale || (msg.sender == owner()), "Trading is not allowed for users");
        require(msg.sender == ownerOf(_tokenId), "This is not your NFT");
        require(price > 0, "Price must be greater than zero");
        if (_erc20 != address(0)) {
            // Sell with ERC20
            require(isAllowedERC20(_erc20) == true, "This ERC20 not allowed as a trading currency");
        }

        _isTokensAtSale[_tokenId] = true;
        _tokensAtSale[_tokenId] = SelledNFT(
            _tokenId,
            tokenURI(_tokenId),
            msg.sender,
            price,
            _erc20
        );
        _transfer(msg.sender, address(this), _tokenId);
        if (_erc20 == address(0)) {
            emit PutUpForSaleWithERC20(msg.sender, _tokenId, _tokensAtSale[_tokenId].uri, _erc20, price);
        } else {
            emit PutUpForSale(msg.sender, _tokenId, _tokensAtSale[_tokenId].uri, price);
        }
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
        payable(owner()).transfer(msg.value);
        fixTotalSupply();
        emit Mint(msg.sender, newItemId, tokenURI(newItemId));
        return newItemId;
    }

    function mintNFTForSell(
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
            require( prices[i] > 0, "Price must be great than zero.");
            if (erc20[i] != address(0)) {
                require(isAllowedERC20(erc20[i]), "Not allowed ERC for trade.");
            }
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
        fixTotalSupply();
        return ret;
    }

    function mint(address recipient, string memory tokenURI)
        public payable
        returns (uint256)
    {
        require(_blackList[msg.sender] == false, "This account is blacklisted");
        require(_allowOwnMint == true, "Own Mint not allowed");
        require(_ownMintPrice > 0, "Mint price not configured");
        require(msg.value >= _ownMintPrice, "You have not paid enough for mint");

        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        fixTotalSupply();
        emit Mint(recipient, newItemId, tokenURI);
        return newItemId;
    }

    function burn(uint256 tokenId) public onlyOwner {
        _setTokenURI(tokenId,"");
    }

    function mintNFT(address recipient, string memory tokenURI)
        public onlyOwner
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);

        fixTotalSupply();
        emit Mint(recipient, newItemId, tokenURI);
        return newItemId;
    }
}
