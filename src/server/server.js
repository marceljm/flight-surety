const FlightSuretyApp = require('../../build/contracts/FlightSuretyApp.json');
const Config = require('./config.json');
var Web3 = require("web3");
const express = require('express')


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);


flightSuretyApp.events.OracleRequest({
    fromBlock: 0
}, function (error, event) {
    if (error) console.log(error)
    // console.log(event)
});

const app = express();
app.get('/api', (req, res) => {
    res.send({
        message: 'An API for use with your Dapp!'
    })
})

app.listen(3000, () => console.log('Server running on port 3000!'))

module.exports={app}

// account [0]: contract owner
// accounts [1,5]: airlines
// accounts [6,10]: passengers
// accounts [11,]: oracles

web3.eth.getAccounts((error, accounts) => {
    flightSuretyApp.methods.REGISTRATION_FEE().call((error, fee) => {
        for (let i = 11; i < accounts.length; i++) {
            // console.log(i, accounts[i]);
            flightSuretyApp.methods.registerOracle().send({ from: accounts[i], value: fee, gas: 999999 }, (error, result) => {
                flightSuretyApp.methods.getMyIndexes().call({ from: accounts[i] }, (error, index) => {
                    console.log(i-10, `\tOracle Registered: ${index[0]}, ${index[1]}, ${index[2]}`);
                });
            });
        }
    });
});