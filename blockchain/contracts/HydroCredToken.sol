// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title HydroCredToken
 * @dev ERC721 token representing green hydrogen credits with hierarchical admin system
 * Each token represents 1 kg of certified green hydrogen production
 */
contract HydroCredToken is ERC721, ERC721Enumerable, AccessControl, Pausable {
    using ECDSA for bytes32;

    // Role definitions
    bytes32 public constant MAIN_ADMIN_ROLE = keccak256("MAIN_ADMIN_ROLE");
    bytes32 public constant COUNTRY_ADMIN_ROLE = keccak256("COUNTRY_ADMIN_ROLE");
    bytes32 public constant STATE_ADMIN_ROLE = keccak256("STATE_ADMIN_ROLE");
    bytes32 public constant CITY_ADMIN_ROLE = keccak256("CITY_ADMIN_ROLE");
    bytes32 public constant PRODUCER_ROLE = keccak256("PRODUCER_ROLE");
    bytes32 public constant BUYER_ROLE = keccak256("BUYER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");

    uint256 private _nextTokenId = 1;
    
    // Admin hierarchy mappings
    mapping(address => bool) public isCountryAdmin;
    mapping(address => uint256) public countryAdminCountryId;
    mapping(address => bool) public isStateAdmin;
    mapping(address => uint256) public stateAdminStateId;
    mapping(address => bool) public isCityAdmin;
    mapping(address => uint256) public cityAdminCityId;
    mapping(address => bool) public isProducer;
    mapping(address => bool) public isBuyer;
    mapping(address => bool) public isAuditor;

    // Certification and minting
    mapping(bytes32 => bool) public certificationHashUsed;
    mapping(uint256 => CertificationData) public tokenCertifications;
    
    // Token metadata
    mapping(uint256 => bool) public isRetired;
    mapping(uint256 => address) public retiredBy;
    mapping(uint256 => uint256) public retiredAt;
    mapping(uint256 => string) public tokenMetadata;

    struct CertificationData {
        address producer;
        address certifier;
        uint256 timestamp;
        string metadata;
        bytes32 certificationHash;
    }

    // Events
    event CreditsIssued(address indexed to, uint256 amount, uint256 fromId, uint256 toId, bytes32 certificationHash);
    event CreditRetired(address indexed owner, uint256 indexed tokenId, uint256 timestamp);
    event CountryAdminAppointed(address indexed admin, uint256 countryId, address indexed appointedBy);
    event StateAdminAppointed(address indexed admin, uint256 stateId, address indexed appointedBy);
    event CityAdminAppointed(address indexed admin, uint256 cityId, address indexed appointedBy);
    event ProducerRegistered(address indexed producer, address indexed registeredBy);
    event BuyerRegistered(address indexed buyer);
    event AuditorRegistered(address indexed auditor, address indexed registeredBy);
    event RoleRevoked(address indexed account, string role, address indexed revokedBy);

    constructor(address mainAdmin) ERC721("HydroCred Token", "H2CRED") {
        require(mainAdmin != address(0), "Main admin cannot be zero address");
        
        _grantRole(DEFAULT_ADMIN_ROLE, mainAdmin);
        _grantRole(MAIN_ADMIN_ROLE, mainAdmin);
    }

    /**
     * @dev Mint tokens only through certification workflow
     * @param to Producer address to receive tokens
     * @param amount Number of tokens to mint
     * @param certificationHash Hash of certification data
     * @param certifierSignature Signature from city admin
     */
    function mintWithCertification(
        address to,
        uint256 amount,
        bytes32 certificationHash,
        bytes calldata certifierSignature
    ) external whenNotPaused {
        require(to != address(0), "Cannot mint to zero address");
        require(amount > 0 && amount <= 1000, "Invalid amount");
        require(isProducer[to], "Recipient must be registered producer");
        require(!certificationHashUsed[certificationHash], "Certification hash already used");
        
        // Verify certifier signature
        bytes32 messageHash = keccak256(abi.encodePacked(to, amount, certificationHash));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address certifier = ethSignedMessageHash.recover(certifierSignature);
        
        require(hasRole(CITY_ADMIN_ROLE, certifier), "Invalid certifier signature");
        
        // Mark certification hash as used
        certificationHashUsed[certificationHash] = true;
        
        uint256 fromId = _nextTokenId;
        uint256 toId = _nextTokenId + amount - 1;
        
        for (uint256 i = 0; i < amount; i++) {
            _safeMint(to, _nextTokenId);
            
            // Store certification data
            tokenCertifications[_nextTokenId] = CertificationData({
                producer: to,
                certifier: certifier,
                timestamp: block.timestamp,
                metadata: "",
                certificationHash: certificationHash
            });
            
            _nextTokenId++;
        }
        
        emit CreditsIssued(to, amount, fromId, toId, certificationHash);
    }

    /**
     * @dev Appoint country admin (Main Admin only)
     */
    function appointCountryAdmin(address admin, uint256 countryId) 
        external 
        onlyRole(MAIN_ADMIN_ROLE) 
    {
        require(admin != address(0), "Admin cannot be zero address");
        require(!isCountryAdmin[admin], "Already a country admin");
        
        isCountryAdmin[admin] = true;
        countryAdminCountryId[admin] = countryId;
        _grantRole(COUNTRY_ADMIN_ROLE, admin);
        
        emit CountryAdminAppointed(admin, countryId, msg.sender);
    }

    /**
     * @dev Appoint state admin (Country Admin only)
     */
    function appointStateAdmin(address admin, uint256 stateId) 
        external 
        onlyRole(COUNTRY_ADMIN_ROLE) 
    {
        require(admin != address(0), "Admin cannot be zero address");
        require(!isStateAdmin[admin], "Already a state admin");
        
        isStateAdmin[admin] = true;
        stateAdminStateId[admin] = stateId;
        _grantRole(STATE_ADMIN_ROLE, admin);
        
        emit StateAdminAppointed(admin, stateId, msg.sender);
    }

    /**
     * @dev Appoint city admin (State Admin only)
     */
    function appointCityAdmin(address admin, uint256 cityId) 
        external 
        onlyRole(STATE_ADMIN_ROLE) 
    {
        require(admin != address(0), "Admin cannot be zero address");
        require(!isCityAdmin[admin], "Already a city admin");
        
        isCityAdmin[admin] = true;
        cityAdminCityId[admin] = cityId;
        _grantRole(CITY_ADMIN_ROLE, admin);
        
        emit CityAdminAppointed(admin, cityId, msg.sender);
    }

    /**
     * @dev Register producer (City Admin only)
     */
    function registerProducer(address producer) 
        external 
        onlyRole(CITY_ADMIN_ROLE) 
    {
        require(producer != address(0), "Producer cannot be zero address");
        require(!isProducer[producer], "Already a producer");
        
        isProducer[producer] = true;
        _grantRole(PRODUCER_ROLE, producer);
        
        emit ProducerRegistered(producer, msg.sender);
    }

    /**
     * @dev Register buyer (self-registration)
     */
    function registerBuyer() external {
        require(!isBuyer[msg.sender], "Already a buyer");
        
        isBuyer[msg.sender] = true;
        _grantRole(BUYER_ROLE, msg.sender);
        
        emit BuyerRegistered(msg.sender);
    }

    /**
     * @dev Register auditor (Main Admin only)
     */
    function registerAuditor(address auditor) 
        external 
        onlyRole(MAIN_ADMIN_ROLE) 
    {
        require(auditor != address(0), "Auditor cannot be zero address");
        require(!isAuditor[auditor], "Already an auditor");
        
        isAuditor[auditor] = true;
        _grantRole(AUDITOR_ROLE, auditor);
        
        emit AuditorRegistered(auditor, msg.sender);
    }

    /**
     * @dev Retire a credit (makes it non-transferable)
     */
    function retire(uint256 tokenId) external {
        require(_ownerOf(tokenId) == msg.sender, "Only owner can retire credit");
        require(!isRetired[tokenId], "Credit already retired");
        
        isRetired[tokenId] = true;
        retiredBy[tokenId] = msg.sender;
        retiredAt[tokenId] = block.timestamp;
        
        emit CreditRetired(msg.sender, tokenId, block.timestamp);
    }

    /**
     * @dev Override transfer to prevent retired token transfers
     */
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override(ERC721, ERC721Enumerable) 
        whenNotPaused 
        returns (address) 
    {
        address from = _ownerOf(tokenId);
        if (from != address(0)) { // Skip check for minting
            require(!isRetired[tokenId], "Cannot transfer retired credit");
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Get all token IDs owned by an address
     */
    function tokensOfOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }

    /**
     * @dev Get certification data for a token
     */
    function getCertificationData(uint256 tokenId) 
        external 
        view 
        returns (CertificationData memory) 
    {
        require(_exists(tokenId), "Token does not exist");
        return tokenCertifications[tokenId];
    }

    /**
     * @dev Pause contract (Main Admin only)
     */
    function pause() external onlyRole(MAIN_ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract (Main Admin only)
     */
    function unpause() external onlyRole(MAIN_ADMIN_ROLE) {
        _unpause();
    }

    // Required overrides
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _increaseBalance(address account, uint128 value) 
        internal 
        override(ERC721, ERC721Enumerable) 
    {
        super._increaseBalance(account, value);
    }
}