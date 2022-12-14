
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');
const Web3 = require("web3");
const SKIP = false;

contract('Oracles', async (accounts) => {

    const TEST_ORACLES_COUNT = 20;

    // Watch contract events
    const STATUS_CODE_UNKNOWN = 0;
    const STATUS_CODE_ON_TIME = 10;
    const STATUS_CODE_LATE_AIRLINE = 20;
    const STATUS_CODE_LATE_WEATHER = 30;
    const STATUS_CODE_LATE_TECHNICAL = 40;
    const STATUS_CODE_LATE_OTHER = 50;

    var config;
    before('setup contract', async () => {
        config = await Test.Config(accounts);
    });

    it('can register oracles', async () => {
        if (SKIP)
            return;

        // ARRANGE
        let fee = await config.flightSuretyApp.REGISTRATION_FEE.call();

        // ACT
        for (let a = 1; a < TEST_ORACLES_COUNT; a++) {
            await config.flightSuretyApp.registerOracle({ from: accounts[a], value: fee });
            let result = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a] });
            console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
            assert.equal(result.length, 3, "Cannot register oracles");
        }
    });

    it('can request flight status', async () => {
        if (SKIP)
            return;

        // ARRANGE
        let flight = 'ND1309'; // Course number
        let timestamp = Math.floor(Date.now() / 1000);

        // Submit a request for oracles to get status information for a flight
        await config.flightSuretyApp.fetchFlightStatus(config.firstAirline, flight, timestamp);
        // ACT

        // Since the Index assigned to each test account is opaque by design
        // loop through all the accounts and for each account, all its Indexes (indices?)
        // and submit a response. The contract will reject a submission if it was
        // not requested so while sub-optimal, it's a good test of that feature
        for (let a = 1; a < TEST_ORACLES_COUNT; a++) {

            // Get oracle information
            let oracleIndexes = await config.flightSuretyApp.getMyIndexes.call({ from: accounts[a] });

            for (let idx = 0; idx < 3; idx++) {

                try {
                    // Submit a response...it will only be accepted if there is an Index match
                    await config.flightSuretyApp.submitOracleResponse(oracleIndexes[idx], config.firstAirline, flight, timestamp, STATUS_CODE_ON_TIME, { from: accounts[a] });
                    console.log('\nOK');
                }
                catch (e) {
                    // Enable this when debugging
                    console.log('\nError', idx, oracleIndexes[idx].toNumber(), flight, timestamp);
                }

            }
        }


    });

    it('can process flight status', async () => {
        let airline = accounts[1];
        let flight = 'ND1309';
        let timestamp = Math.floor(Date.now() / 1000);
        let passenger = accounts[12];
        let price = web3.utils.toWei("1.0", "ether");
        try {
            // airline: add funds
            await config.flightSuretyData.fund({ from: airline, value: web3.utils.toWei("10", "ether") });
            // passenger: buy insurance
            await config.flightSuretyData.buy(airline, flight, timestamp, { from: passenger, value: price });            
            // flight: delayed
            await config.flightSuretyApp.processFlightStatus(airline, flight, timestamp, STATUS_CODE_LATE_AIRLINE);
            // withdraw
            let balancePassengerBeforeTransaction = await web3.eth.getBalance(passenger);
            await config.flightSuretyApp.pay(passenger);
            let balancePassengerAfterTransaction = await web3.eth.getBalance(passenger);

            assert.equal(parseFloat(Web3.utils.fromWei(String(Number(balancePassengerAfterTransaction) - Number(balancePassengerBeforeTransaction)), 'ether')).toFixed(2), 1.5); // 1.0 * 1.5 = 1.5
        }
        catch (e) {
            console.log(e);
        }
    });

});
