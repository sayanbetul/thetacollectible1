// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



contract ThetaCollectibles is ERC721,ERC721Pausable, AccessControl,Ownable {

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    uint256 private _nextTokenId;


    constructor(address _reflectionPoolAddress, address _birthdayBabyPoolAddress, address _houseFeeAddress) ERC721("ThetaCollectibles", "THETA") Ownable(msg.sender) {
        reflectionPoolAddress = _reflectionPoolAddress;
        birthdayBabyPoolAddress = _birthdayBabyPoolAddress;
        houseFeeAddress = _houseFeeAddress;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);

    }

    // Prevent confliction
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721, AccessControl) returns (bool) {
        return (ERC721.supportsInterface(interfaceId) || AccessControl.supportsInterface(interfaceId));
    }

    function _update(address to, uint256 tokenId, address auth)
    internal
    override(ERC721, ERC721Pausable)
    returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    // Reflection pool address
    address public reflectionPoolAddress;
    // Birthday baby pool address
    address public birthdayBabyPoolAddress;
    // House fee address
    address public houseFeeAddress;

    // Constants
    uint256 public constant MINT_PRICE = 0.0011 ether;
    uint8 public constant MINT_TAX_PERCENTAGE = 15;
    uint8 public constant REFLECTION_POOL_PERCENTAGE = 5;
    uint8 public constant BIRTHDAY_BABY_POOL_PERCENTAGE = 5;
    uint8 public constant HOUSE_FEE_PERCENTAGE = 5;

    struct AstroData {
        address owner;
        bytes32 url;
    }


    // Mapping from tokenId to astrological data
    mapping(uint256 => AstroData) public astroData;

    // Event for minting
    event ThetaMinted(address indexed owner, uint256 indexed tokenId, AstroData);

    // Pause contract actions for safety
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    // Resume contract actions
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }


    // Get minter role for users
    function getMinterRole() public {
        _grantRole(MINTER_ROLE, msg.sender);
    }

    // Mint NFT
    function mintTheta(bytes32 url) external payable onlyRole(MINTER_ROLE) {
        require(msg.value >= MINT_PRICE, "Insufficient ETH sent");


        // Calculate tax amount
        uint256 taxAmount = (msg.value * MINT_TAX_PERCENTAGE) / 100;

        // Distribute tax
        uint256 reflectionPoolAmount = (taxAmount * REFLECTION_POOL_PERCENTAGE) / 100;
        uint256 birthdayBabyPoolAmount = (taxAmount * BIRTHDAY_BABY_POOL_PERCENTAGE) / 100;
        uint256 houseFeeAmount = (taxAmount * HOUSE_FEE_PERCENTAGE) / 100;

        // Transfer tax to respective addresses
        payable(reflectionPoolAddress).transfer(reflectionPoolAmount);
        payable(birthdayBabyPoolAddress).transfer(birthdayBabyPoolAmount);
        payable(houseFeeAddress).transfer(houseFeeAmount);

        // Mint the NFT
        uint256 tokenId = _nextTokenId + 1;
        _mint(msg.sender, tokenId);
        astroData[tokenId] = AstroData(msg.sender, url);

        // Emit minting event
        emit ThetaMinted(msg.sender, tokenId, AstroData(msg.sender, url));
    }

}