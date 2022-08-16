
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const Web3 = require("web3");


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

        // Get operating status
        let status = await config.flightSuretyData.isOperational.call();
        assert.equal(status, true, "Incorrect initial operating status value");

    });

    it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

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

        await config.flightSuretyData.setOperatingStatus(false);

        // ARRANGE
        let newAirline = accounts[2];

        let reverted = false;
        try {
            await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
        }
        catch (e) {
            reverted = true;
        }
        assert.equal(reverted, true, "Access not blocked for requireIsOperational");

        // Set it back for other tests to work
        await config.flightSuretyData.setOperatingStatus(true);

    });

    it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {

        await config.flightSuretyData.setOperatingStatus(true);

        // ARRANGE
        let newAirline = accounts[2];

        // ACT
        try {
            await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
        }
        catch (e) {

        }
        let result = await config.flightSuretyData.isAirline.call(newAirline);

        // ASSERT
        assert.equal(result, false, "Airline should not be able to register another airline if it hasn't provided funding");

    });

    it('(airline) is registered when contract is deployed.', async () => {
        let result = await config.flightSuretyData.isAirline.call(config.firstAirline);
        assert.equal(result, true, "First airline is NOT registered when contract is deployed.");
    });

    it('(airline) can send funds to the smart contact.', async () => {
        let balanceAirlineBeforeTransaction = await web3.eth.getBalance(config.firstAirline);
        let balanceDataBeforeTransaction = await web3.eth.getBalance(config.flightSuretyData.address);

        await config.flightSuretyData.fund({ from: config.firstAirline, value: web3.utils.toWei("10", "ether") });

        let balanceAirlineAfterTransaction = await web3.eth.getBalance(config.firstAirline);
        let balanceDataAfterTransaction = await web3.eth.getBalance(config.flightSuretyData.address);

        assert.isAbove(Number(balanceAirlineBeforeTransaction), Number(balanceAirlineAfterTransaction) + 10 * (new BigNumber(10)).pow(18));
        assert.equal(Web3.utils.fromWei(String(Number(balanceDataAfterTransaction) - Number(balanceDataBeforeTransaction)), 'ether'), 10);
    });

    it('(airline) can register an Airline using registerAirline() if it is funded', async () => {
        let newAirline = accounts[2];

        try {
            await config.flightSuretyData.fund({ from: newAirline, value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(newAirline, { from: config.firstAirline });
        }
        catch (e) {
            console.log(e);
        }
        let result = await config.flightSuretyData.isAirline.call(newAirline);

        assert.equal(result, true, "Airline should not be able to register another airline if it hasn't provided funding");
    });

    it('(airline) only existing airline may register a new airline until there are at least four airlines registered', async () => {
        let newAirline = accounts[3];

        try {
            await config.flightSuretyData.fund({ from: accounts[3], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[3], { from: accounts[2] });
        }
        catch (e) {

        }
        let result = await config.flightSuretyData.isAirline.call(accounts[3]);

        assert.equal(result, false, "Only existing airline may register a new airline until there are at least four airlines registered");
    });

    it('(airline) other airlines may register when there are at least 3 airlines registered', async () => {
        try {
            // registered by the first airline
            await config.flightSuretyData.fund({ from: accounts[3], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[3], { from: config.firstAirline });
            await config.flightSuretyData.fund({ from: accounts[4], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[4], { from: config.firstAirline });

            // registered by the third airline
            await config.flightSuretyData.fund({ from: accounts[5], value: web3.utils.toWei("10", "ether") });
            await config.flightSuretyApp.registerAirline(accounts[5], { from: accounts[3]});
        }
        catch (e) {

        }
        let result = await config.flightSuretyData.isAirline.call(accounts[5]);

        assert.equal(result, true, "At least 3 airlines should be registered.");
    });

});
