
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const Web3 = require("web3");
const SKIP = true;

contract('Flight Surety Tests', async (accounts) => {

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
        await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    });

    /****************************************************************************************/
    /* Operations and Settings                                                              */
    /****************************************************************************************/

    it(`(multiparty) has correct initial isOperational() value`, async function () {
        if (SKIP) return;
        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {
        if (SKIP) return;
        // Ensure that access is denied for non-Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
        }
        catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, true, "Access not restricted to Contract Owner");

    });

    it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {
        if (SKIP) return;
        // Ensure that access is allowed for Contract Owner account
        let accessDenied = false;
        try {
            await config.flightSuretyData.setOperatingStatus(false);
        }
        catch (e) {
            accessDenied = true;
        }
        assert.equal(accessDenied, false, "Access not restricted to Contract Owner");

    });

    it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {
        if (SKIP) return;
        await config.flightSuretyData.setOperatingStatus(false);

        // ARRANGE
        let newAirline = accounts[2];

        let reverted = false;
        try {
            await config.flightSuretyApp.registerAirline(newAirline, '2nd', { from: config.firstAirline });
        }
        catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);

    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
        if (SKIP) return;
        await config.flightSuretyData.setOperatingStatus(true);

        // ARRANGE
        let newAirline = accounts[2];

        // ACT
        try {
            await config.flightSuretyApp.registerAirline(newAirline, '2nd', { from: config.firstAirline });
        }
        catch (e) {

        }
        let result = await config.flightSuretyData.isAirline.call(newAirline);

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

    });

    it('(airline) is registered when contract is deployed.', async () => {
        if (SKIP) return;
        let result = await config.flightSuretyData.isAirline.call(config.firstAirline);
        assert.equal(result, true, "First airline is NOT registered when contract is deployed.");
    });

    it('(airline) can send funds to the smart contact.', async () => {
        if (SKIP) return;
        let balanceAirlineBeforeTransaction = await web3.eth.getBalance(config.firstAirline);
        let balanceDataBeforeTransaction = await web3.eth.getBalance(config.flightSuretyData.address);

        await config.flightSuretyData.fund({ from: config.firstAirline, value: web3.utils.toWei("10", "ether") });

        let balanceAirlineAfterTransaction = await web3.eth.getBalance(config.firstAirline);
        let balanceDataAfterTransaction = await web3.eth.getBalance(config.flightSuretyData.address);

        assert.isAbove(Number(balanceAirlineBeforeTransaction), Number(balanceAirlineAfterTransaction) + 10 * (new BigNumber(10)).pow(18));
        assert.equal(Web3.utils.fromWei(String(Number(balanceDataAfterTransaction) - Number(balanceDataBeforeTransaction)), 'ether'), 10);
    });

    it('(airline) can register an Airline using registerAirline() if it is funded', async () => {
        if (SKIP) return;
        let newAirline = accounts[2];

        try {
            await config.flightSuretyData.fund({ from: newAirline, value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(newAirline, '2nd', { from: config.firstAirline });
        }
        catch (e) {
            console.log(e);
        }
        let result = await config.flightSuretyData.isAirline.call(newAirline);

        assert.equal(result, true, "Airline should not be able to register another airline if it hasn't provided funding");
    });

    it('(airline) only existing airline may register a new airline until there are at least four airlines registered', async () => {
        if (SKIP) return;
        let newAirline = accounts[3];

        try {
            await config.flightSuretyData.fund({ from: accounts[3], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[3], '3rd', { from: accounts[2] });
        }
        catch (e) {

        }
        let result = await config.flightSuretyData.isAirline.call(accounts[3]);

        assert.equal(result, false, "Only existing airline may register a new airline until there are at least four airlines registered");
    });

    it('(airline) other airlines may register when there are at least 3 airlines registered', async () => {
        if (SKIP) return;
        try {
            // registered by the first airline
            await config.flightSuretyData.fund({ from: accounts[4], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[4], '4th', { from: config.firstAirline });
            await config.flightSuretyData.fund({ from: accounts[5], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[5], '5th', { from: config.firstAirline });

            // registered by the third airline
            await config.flightSuretyData.fund({ from: accounts[6], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[6], '6th', { from: accounts[3] });
        }
        catch (e) {
            console.log(e);
        }
        let result = await config.flightSuretyData.isAirline.call(accounts[6]);

        assert.equal(result, true, "At least 3 airlines should be registered.");
    });

    it('(airline) registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines', async () => {
        if (SKIP) return;
        try {
            // 3 votes
            for (i = 1; i <= 3; i++)
                await config.flightSuretyApp.registerVote(accounts[7], { from: accounts[i] });

            await config.flightSuretyData.fund({ from: accounts[7], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[7], '7th', { from: config.firstAirline });
        }
        catch (e) {
        }
        let result = await config.flightSuretyData.isAirline.call(accounts[7]);
        assert.equal(result, true, "Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines.");
    });

    it('(airline) does not participate in contract until it submits funding of 10 ether (make sure it is not 10 wei)', async () => {
        if (SKIP) return;
        try {
            // votes
            for (i = 1; i <= 7; i++) {
                await config.flightSuretyApp.registerVote(accounts[8], { from: accounts[i] });
                await config.flightSuretyApp.registerVote(accounts[9], { from: accounts[i] });
                await config.flightSuretyApp.registerVote(accounts[10], { from: accounts[i] });
            }

            // register
            await config.flightSuretyData.fund({ from: accounts[8], value: web3.utils.toWei("5", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[8], '8th', { from: config.firstAirline });
            await config.flightSuretyData.fund({ from: accounts[9], value: web3.utils.toWei("5", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[9], '9th', { from: config.firstAirline });
            await config.flightSuretyData.fund({ from: accounts[10], value: web3.utils.toWei("5", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[10], '10th', { from: config.firstAirline });

            // votes
            for (i = 7; i <= 10; i++)
                await config.flightSuretyApp.registerVote(accounts[11], { from: accounts[i] });

            await config.flightSuretyData.fund({ from: accounts[11], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[11], '11th', { from: config.firstAirline });
        }
        catch (e) {
        }
        let result = await config.flightSuretyData.isAirline.call(accounts[11]);
        assert.equal(result, false, "Does not participate in contract until it submits funding of 10 ether (make sure it is not 10 wei)");
    });


    it('(airline) can register flight', async () => {
        let flight = 'ND1309';
        let timestamp = Math.floor(Date.now() / 1000);
        try {
            await config.flightSuretyApp.registerFlight(config.firstAirline, flight, timestamp, { from: config.firstAirline });
        }
        catch (e) {
            console.log(e);
        }
        let result = await config.flightSuretyData.isFlight.call(config.firstAirline, flight, timestamp);
        assert.equal(result, true, "Cannot register flight");
    });

    it('(passenger) can buy issurance using buy()', async () => {
        let airline = accounts[1];
        let flight = 'ND1309';
        let timestamp = Math.floor(Date.now() / 1000);
        let passenger = accounts[12];
        let price = web3.utils.toWei("1.0", "ether");
        
        let balancePassengerBeforeTransaction = await web3.eth.getBalance(passenger);
        let balanceDataBeforeTransaction = await web3.eth.getBalance(config.flightSuretyData.address);
        
        try {
            await config.flightSuretyData.buy(airline, flight, timestamp, { from: passenger, value: price });
        }
        catch (e) {
            console.log(e);
        }
        
        let balancePassengerAfterTransaction = await web3.eth.getBalance(passenger);
        let balanceDataAfterTransaction = await web3.eth.getBalance(config.flightSuretyData.address);
    
        assert.isAbove(Number(balancePassengerBeforeTransaction), Number(balancePassengerAfterTransaction) + 1 * (new BigNumber(10)).pow(18));
        assert.equal(Web3.utils.fromWei(String(Number(balanceDataAfterTransaction) - Number(balanceDataBeforeTransaction)), 'ether'), 1);
    });
});
