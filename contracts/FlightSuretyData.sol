// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../node_modules/openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address payable private contractOwner; // Account used to deploy contract
    bool private operational = true; // Blocks all state changes throughout the contract if false

    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }

    mapping(bytes32 => Flight) private flights;

    mapping(address => uint256) private authorizedCallers;

    struct Airline {
        uint256 funds;
        string name;
    }

    address firstAirline;
    mapping(address => Airline) private airlines;
    mapping(address => bool) private registeredAirlines;
    uint256 private numberOfRegisteredAirlines;
    mapping(address => address[]) private votes;

    struct Insurance {
        address passenger;
        uint256 price;
        bool processed;
    }

    // flight key => array of insurances
    mapping(bytes32 => Insurance[]) private insurances;

    // credit
    mapping(address => uint256) private passengerCredits;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Constructor
     *      The deploying account becomes contractOwner
     */
    constructor(address dataContract) public {
        contractOwner = payable(msg.sender);

        // Airline Contract Initialization: First airline is registered when contract is deployed
        airlines[dataContract] = Airline({name: "Owner", funds: 0});

        registeredAirlines[dataContract] = true;
        numberOfRegisteredAirlines = 1;
        firstAirline = dataContract;
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
     * @dev Modifier that requires the "operational" boolean variable to be "true"
     *      This is used on all state changing functions to pause the contract in
     *      the event there is an issue that needs to be fixed
     */
    modifier requireIsOperational() {
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier requireAirlineFunds(address airline) {
        require(airlines[airline].funds > 0, "Airline is not funded");
        _;
    }

    modifier requireAirlines(address sender, uint8 requiredAirlines) {
        require(
            sender == firstAirline ||
                numberOfRegisteredAirlines >= requiredAirlines,
            "Only existing airline may register a new airline until there are at least four airlines registered"
        );
        _;
    }

    modifier requireConsensus(
        address airline,
        uint8 requiredConsensus,
        uint8 requiredAirlines
    ) {
        require(
            numberOfRegisteredAirlines <= requiredAirlines ||
                votes[airline].length >=
                numberOfRegisteredAirlines.mul(requiredConsensus).div(100),
            "Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines"
        );
        _;
    }

    modifier requireEnoughFunds(address sender, uint256 requiredFunds) {
        require(
            airlines[sender].funds >= requiredFunds,
            "Airline does not participate in contract until it submits funding of 10 ether"
        );
        _;
    }

    modifier requirePriceLimit(uint256 value) {
        require(
            value <= 10**18,
            "Passengers may pay up to 1 ether for purchasing flight insurance."
        );
        _;
    }

    modifier requireStatus(uint8 status) {
        require(
            status == STATUS_CODE_LATE_AIRLINE,
            "Flight should be delayed due to airline fault"
        );
        _;
    }

    modifier requireNotProcessed(Insurance memory insurance) {
        require(
            !insurance.processed,
            "Insurance already processed before"
        );
        _; 
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
     * @dev Get operating status of contract
     *
     * @return A bool that is the current operating status
     */
    function isOperational() public view returns (bool) {
        return operational;
    }

    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(bool mode) external requireContractOwner {
        operational = mode;
    }

    function authorizeCaller(address contractAddress)
        external
        requireContractOwner
    {
        authorizedCallers[contractAddress] = 1;
    }

    function deauthorizeCaller(address contractAddress)
        external
        requireContractOwner
    {
        delete authorizedCallers[contractAddress];
    }

    function isAirline(address airline) external view returns (bool) {
        return registeredAirlines[airline];
    }

    function isFlight(
        address airline,
        string memory flight,
        uint256 timestamp
    ) external view returns (bool) {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        return flights[key].isRegistered;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */
    function registerAirline(
        address airline,
        string memory name,
        address sender,
        uint8 requiredConsensus,
        uint8 requiredAirlines
    )
        external
        requireIsOperational
        requireAirlineFunds(airline)
        requireAirlines(sender, requiredAirlines)
        requireConsensus(airline, requiredConsensus, requiredAirlines)
    {
        registeredAirlines[airline] = true;
        numberOfRegisteredAirlines += 1;
    }

    function registerVote(
        address airline,
        address sender,
        uint256 requiredFunds
    ) external requireIsOperational requireEnoughFunds(sender, requiredFunds) {
        votes[airline].push(sender);
    }

    function registerFlight(
        address airline,
        string memory flight,
        uint256 timestamp
    ) external requireIsOperational {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        flights[key] = Flight(true, 0, timestamp, airline);
    }

    /**
     * @dev Buy insurance for a flight
     *
     */
    function buy(
        address airline,
        string memory flight,
        uint256 timestamp
    ) external payable requirePriceLimit(msg.value) {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        insurances[key].push(
            Insurance({
                passenger: msg.sender,
                price: msg.value,
                processed: false
            })
        );

        uint256 funds = airlines[airline].funds;
        airlines[airline].funds = funds.add(msg.value);
    }

    /**
     * @dev Process insurance for a flight
     *
     */
    function processFlightStatus(
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCode
    ) external requireStatus(statusCode) {
        bytes32 key = getFlightKey(airline, flight, timestamp);
        Insurance[] memory flightInsurances = insurances[key];
        uint8 i = 0;
        while (i < flightInsurances.length) {
            creditInsurees(flightInsurances[i], airline);
            i++;
        }
    }

    /**
     *  @dev Credits payouts to insurees
     */
    function creditInsurees(Insurance memory insurance, address airline) private requireNotProcessed(insurance) {
        uint256 value = SafeMath.div(SafeMath.mul(insurance.price, 3), 2);
        uint256 airlineBalance = airlines[airline].funds;
        uint256 passengerBalance = passengerCredits[insurance.passenger];
        airlines[airline].funds = airlineBalance.sub(value);
        passengerCredits[insurance.passenger] = passengerBalance.add(value);
    }

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
     */
    function pay() external pure {}

    /**
     * @dev Initial funding for the insurance. Unless there are too many delayed flights
     *      resulting in insurance payouts, the contract should be self-sustaining
     *
     */
    function fund() public payable requireIsOperational {
        uint256 funds = airlines[msg.sender].funds;
        airlines[msg.sender].funds = funds.add(msg.value);
    }

    function getFlightKey(
        address airline,
        string memory flight,
        uint256 timestamp
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    /**
     * @dev Fallback function for funding smart contract.
     *
     */
    fallback() external payable {
        fund();
    }
}
