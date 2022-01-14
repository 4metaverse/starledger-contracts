// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract StarLedgerNFT is ERC721URIStorage, Ownable {
    MarketState private _marketState = MarketState.offline;
    MintState private _mintState = MintState.pending;

    uint256 private _maxPresales = 1000;
    uint256 private _maxStars = 5000;

    uint256 public _mintCount = 0;
    uint256 public _mintFee = 1;

    mapping(address => PioneerState) private _pioneers;

    mapping(uint256 => uint256) private _starForSale;

    uint256 private _tokenId = 1;

    Star[] private _availableStars;

    enum PioneerState {
        pending,
        approved,
        rejected
    }

    enum MarketState {
        offline,
        online
    }

    enum MintState {
        pending,
        presale,
        minting,
        complete
    }

    struct NewStar {
        uint256 id;
        string tokenUri;
    }

    struct Star {
        uint256 id;
        address owner;
        uint256 amount;
        string tokenUri;
    }

    constructor() ERC721("StarLedgerNFT", "SLMINT") {}

    function _compareStrings(string memory a, string memory b)
        private
        pure
        returns (bool)
    {
        return (keccak256(abi.encodePacked((a))) ==
            keccak256(abi.encodePacked((b))));
    }

    function addPioneer(address recipient) public onlyOwner {
        require(
            _mintState == MintState.pending || _mintState == MintState.presale,
            "Presale is over."
        );

        // add address to presale list
        _pioneers[recipient] = PioneerState.approved;
    }

    function addStars(NewStar[] memory stars) public onlyOwner {
        require(
            _availableStars.length + stars.length < 5000,
            "Too many stars."
        );

        bool isUnique = true;
        for (uint256 i = 0; i < stars.length; i++) {
            for (uint256 n = 0; n < stars.length; n++) {
                if (
                    n != i &&
                    (stars[n].id == stars[i].id ||
                        _compareStrings(stars[n].tokenUri, stars[i].tokenUri))
                ) {
                    isUnique = false;
                }
            }
            for (uint256 n = 0; n < _availableStars.length; n++) {
                if (
                    _availableStars[n].id == stars[i].id ||
                    _compareStrings(
                        _availableStars[n].tokenUri,
                        stars[i].tokenUri
                    )
                ) {
                    isUnique = false;
                }
            }
        }
        require(isUnique, "Duplicate star.");

        // add each star to available stars
        for (uint256 i = 0; i < stars.length; i++) {
            _availableStars.push(
                Star(stars[i].id, owner(), 0, stars[i].tokenUri)
            );
        }
    }

    function buyStar(uint256 id) public payable {
        require(_marketState == MarketState.online, "Market is offline.");

        require(ownerOf(id) != msg.sender, "You already own this star.");

        require(_starForSale[id] > 0, "Star not for sale.");

        require(msg.value >= _starForSale[id], "Insufficient value.");

        payable(owner()).transfer(msg.value);

        _transfer(ownerOf(id), msg.sender, id);

        delete _starForSale[id];
    }

    function getStar(uint256 id) public view returns (Star memory) {
        return
            Star(
                id,
                ownerOf(id),
                _starForSale[id],
                _availableStars[0].tokenUri
            );
    }

    function listStars() public view returns (Star[] memory) {
        return _availableStars;
    }

    function getMarketState() public view returns (MarketState) {
        return _marketState;
    }

    function getMaxPresales() public view returns (uint256) {
        return _maxPresales;
    }

    function getMaxStars() public view returns (uint256) {
        return _maxStars;
    }

    function getMintFee() public view returns (uint256) {
        return _mintFee;
    }

    function getMintState() public view returns (MintState) {
        return _mintState;
    }

    function keepStar(uint256 id) public {
        require(ownerOf(id) == msg.sender, "You do not own this star.");

        delete _starForSale[id];
    }

    function mintStars(uint256 count)
        public
        payable
        returns (uint256[] memory)
    {
        bool isPresale = _mintState == MintState.presale &&
            (msg.sender == owner() ||
                _pioneers[msg.sender] == PioneerState.approved);
        bool isMinting = _mintState == MintState.minting;

        require(isPresale || isMinting, "Minting is not available.");

        require(
            _mintCount < _availableStars.length,
            "All stars have been minted."
        );

        require(
            _mintCount + count <= _availableStars.length,
            "There are not enough stars."
        );

        require(msg.value >= _mintFee * count, "Insuffient amount.");

        // pay mint fee
        payable(owner()).transfer(msg.value);

        // mint each star
        uint256[] memory starIds = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            _mint(msg.sender, _tokenId);
            _setTokenURI(_tokenId, _availableStars[_tokenId].tokenUri);

            starIds[i] = _tokenId;

            _mintCount++;
            _tokenId++;
        }

        // no more stars to mint
        if (_mintCount >= _availableStars.length) {
            _mintState = MintState.complete;
        }

        return starIds;
    }

    function removePioneer(address recipient) public onlyOwner {
        delete _pioneers[recipient];
    }

    function removeStar(NewStar[] memory stars) public onlyOwner {
        require(
            _availableStars.length + stars.length < 5000,
            "Too many stars."
        );

        // add each star to available stars
        for (uint256 i = 0; i < stars.length; i++) {
            _availableStars.push(
                Star(stars[i].id, owner(), 0, stars[i].tokenUri)
            );
        }
    }

    function sellStar(uint256 id, uint256 value) public {
        require(_marketState == MarketState.online, "Market is offline.");

        require(ownerOf(id) == msg.sender, "You do not own this star.");

        require(value > 0, "Invalid value.");

        _starForSale[id] = value;
    }

    function updateMaxPresales(uint256 maxPresales) public onlyOwner {
        _maxPresales = maxPresales;
    }

    function updateMaxStars(uint256 maxStars) public onlyOwner {
        _maxStars = maxStars;
    }

    function updateMintFee(uint256 fee) public onlyOwner {
        _mintFee = fee;
    }

    function updateMintState(MintState mintState) public onlyOwner {
        _mintState = mintState;
    }

    function updateMarketState(MarketState marketState) public onlyOwner {
        _marketState = marketState;
    }
}
