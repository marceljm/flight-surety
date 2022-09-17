const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
const Config = require('./config.json');
var Web3 = require("web3");
const express = require('express')
const bodyParser = require('body-parser');


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightStatus = 0;

flightSuretyApp.events.OracleRequest({
    fromBlock: 0
}, function (error, event) {
    if (error)
        console.log(error);
});

flightSuretyApp.events.FlightStatusInfo({
    fromBlock: 0
}, function (error, event) {
    if (error)
        console.log(error);
    else
        flightStatus = event.returnValues['status'];
});

const app = express();
var cors = require('cors');
app.use(cors({ origin: "http://localhost:8000", optionsSuccessStatus: 200 }));
app.use(express.json());

app.get('/api', (req, res) => {
    res.send({
        message: 'An API for use with your Dapp!'
    })
})

app.post('/submit-oracle-responses', cors(), (req, res) => {
    airline = req.body['airline'];
    flight = req.body['flight'];
    timestamp = req.body['timestamp'];
    console.log(airline, flight, timestamp);

    flightStatus = 0;

    web3.eth.getAccounts(async (error, accounts) => {
        let numberAccounts = accounts.length;
        numberAccounts = 16;// REMOVE ME
        for (let i = 11; i < numberAccounts; i++) {
            let status = 20;//getRandomInt(5) * 10;
            let oracleIndexes = await flightSuretyApp.methods.getMyIndexes().call({ from: accounts[i] });
            console.log(i, oracleIndexes, status);

            for (let idx = 0; idx < 3; idx++) {
                try {
                    await flightSuretyApp.methods.submitOracleResponse(oracleIndexes[idx], airline, flight, timestamp, status).send({ from: accounts[i], gas: "999999" });
                    if (flightStatus > 0) {
                        console.log('OK', flightStatus);
                        res.send({
                            status: flightStatus
                        })                        
                        return;
                    }
                    console.log('Status: OK');
                }
                catch (e) {
                    console.log('Status: not checked');
                }
            }
        }
        res.send({
            status: flightStatus
        });
    });
})

app.listen(3000, () => console.log('Server running on port 3000!'))

module.exports = { app }

// account [0]: contract owner
// accounts [1,5]: airlines
// accounts [6,10]: passengers
// accounts [11,]: oracles

web3.eth.getAccounts(async (error, accounts) => {
    flightSuretyApp.methods.REGISTRATION_FEE().call(async (error, fee) => {
        let numberAccounts = accounts.length;
        numberAccounts = 16;// REMOVE ME
        for (let i = 11; i < numberAccounts; i++) {
            try {
                console.log(i, accounts[i], fee);
                await flightSuretyApp.methods.registerOracle().send({ from: accounts[i], value: fee, gas: "999999" });
            } catch (e) {
                console.log(e);
            }
        }
    });
});

function getRandomInt(max) {
    return Math.floor(Math.random() * max) + 1;
}