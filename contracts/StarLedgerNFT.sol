// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract StarLedgerNFT is ERC721URIStorage, Ownable {
    mapping(uint256 => uint256) public starForSale;

    struct Star {
        address owner;
        uint256 amount;
    }

    constructor() ERC721("StarLedgerNFT", "NFT") {}

    function buyStar(uint256 id) public payable {
        require(ownerOf(id) != msg.sender, "You already own this star.");
        require(ownerOf(id) == owner() || starForSale[id] > 0, "Star already sold.");

        uint requiredValue = starForSale[id];
        if (starForSale[id] == 0) {
            requiredValue = 2;
        }

        require(msg.value >= requiredValue, "Insufficient value.");

        _transfer(ownerOf(id), msg.sender, id);

        starForSale[id] = 0;
    }

    function getStar(
        uint256 id
    ) public view returns (Star memory) {
        return Star(ownerOf(id), starForSale[id]);
    }

    function mintStar(
        uint256 id,
        address recipient,
        string memory tokenURI
    ) public onlyOwner returns (uint256) {
        _mint(recipient, id);
        _setTokenURI(id, tokenURI);
        return id;
    }

    function sellStar(uint256 id, uint256 value) public payable {
        require(ownerOf(id) != owner(), "Star already for sale.");
        require(ownerOf(id) == msg.sender, "You do not own this star.");

        require(msg.value >= 0, "Insufficient value.");

        starForSale[id] = value;
    }
}
