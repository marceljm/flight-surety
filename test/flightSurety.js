
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

    it('(airline) First airline is registered when contract is deployed.', async () => {
        let result = await config.flightSuretyData.isAirline.call(config.firstAirline);
        assert.equal(result, true, "First airline is NOT registered when contract is deployed.");
    });

    it('(airline) Fund', async () => {
        let balanceAirlineBeforeTransaction = await web3.eth.getBalance(config.firstAirline);
        let balanceDataBeforeTransaction = await web3.eth.getBalance(config.flightSuretyData.address);
        await config.flightSuretyData.fund({ from: config.firstAirline, value: web3.utils.toWei("10", "ether") });
        let balanceAirlineAfterTransaction = await web3.eth.getBalance(config.firstAirline);
        let balanceDataAfterTransaction = await web3.eth.getBalance(config.flightSuretyData.address);
        console.log(Web3.utils.fromWei(balanceAirlineBeforeTransaction, 'ether'), Web3.utils.fromWei(balanceAirlineAfterTransaction, 'ether'));
        console.log(Web3.utils.fromWei(balanceDataBeforeTransaction, 'ether'), Web3.utils.fromWei(balanceDataAfterTransaction, 'ether'));
    });


});
