// SPDX-License-Identifier: MIT
pragma solidity ^0.8.12;

interface IStorage {
    struct Data {
        address owner;
        string info;
    }

    function getData(string memory _key) external view returns(Data memory);
}

contract ExStorage {
    IStorage public mainStorage;

    struct ScopeKeyData {
        string key;
        string info;
    }

    modifier notEmpty(string memory _value) {
        bytes memory byteValue = bytes(_value);
        require(byteValue.length != 0, 'NO_VALUE');
        _;
    }

    modifier onlyScopeOwner(string memory _scopeKey) {
        IStorage.Data memory _scopeInfo = mainStorage.getData(_scopeKey);
        if (_scopeInfo.owner != address(0)) {
            require(msg.sender == _scopeInfo.owner, 'FORBIDDEN');
        } else {
            require(msg.sender == address(0), 'NOT CONFIGURED IN MAIN STORAGE');
        }
        _;
    }

    mapping (string => mapping (string => string)) public scopeData;
    mapping (string => string[]) public scopeDataKeys;
    mapping (string => mapping (string => bool)) public scopeDataKeyExists;


    constructor(address _mainStorage) {
        mainStorage = IStorage(_mainStorage);
    }

    function clearScopeData(string memory _scopeKey)
        public
        notEmpty(_scopeKey)
        onlyScopeOwner(_scopeKey)
    {
        for (uint256 kIndex = 0; kIndex < scopeDataKeys[_scopeKey].length; kIndex++) {
            scopeDataKeyExists[_scopeKey][scopeDataKeys[_scopeKey][kIndex]] = false;
            scopeData[_scopeKey][scopeDataKeys[_scopeKey][kIndex]] = "";
        }
        delete scopeDataKeys[_scopeKey];
    }

    function getScopeData(string memory _scopeKey)
        public
        view
        notEmpty(_scopeKey)
        returns(ScopeKeyData[] memory)
    {
        ScopeKeyData[] memory retData = new ScopeKeyData[](scopeDataKeys[_scopeKey].length);
        for (uint256 kIndex = 0; kIndex < scopeDataKeys[_scopeKey].length; kIndex++) {
            retData[kIndex] = ScopeKeyData(
                scopeDataKeys[_scopeKey][kIndex],
                scopeData[_scopeKey][scopeDataKeys[_scopeKey][kIndex]]
            );
        }
        return retData;
    }

    function getScopeKeyData(
        string memory _scopeKey,
        string memory _key
    )
        public
        view
        notEmpty(_scopeKey)
        notEmpty(_key)
        returns (string memory)
    {

        return scopeData[_scopeKey][_key];
    }

    function setScopeKeyData(
        string memory _scopeKey,
        string memory _key,
        string memory _data
    )
        public
        notEmpty(_scopeKey)
        notEmpty(_key)
        notEmpty(_data)
        onlyScopeOwner(_scopeKey)
    {
        scopeData[_scopeKey][_key] = _data;
        if (!scopeDataKeyExists[_scopeKey][_key]) {
            scopeDataKeyExists[_scopeKey][_key] = true;
            scopeDataKeys[_scopeKey].push(_key);
        }
    }
}
