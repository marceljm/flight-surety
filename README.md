# FlightSurety

FlightSurety is a sample application project for Udacity's Blockchain course.

## Separation of Concerns, Operational Control and “Fail Fast”

### Smart Contract Seperation

> Smart Contract code is separated into multiple contracts:

> 1) FlightSuretyData.sol for data persistence

> 2) FlightSuretyApp.sol for app logic and oracles code

- Move `flights` and other variables from `App` to `Data` contract. This way, if there is a bug in the logic, we just need to replace the `App` contract while the `Data` contract will keep the same data, avoiding expensive data migration costs. The `App` can request data from `Data` but not the opposite.
- Add `Data` interface to `App`.
- Add state variable referencing `Data` contract in `App`.
- Add `Data` contract address parameter to `App` constructor.
- Initialize state variable referencing `Data` contract in `App`.
- Move logic functions from `Data` to `App`. 
- Change the visibility from `internal` to `external`.

:white_check_mark:

### Dapp Created and Used for Contract Calls

> A Dapp client has been created and is used for triggering contract calls. Client can be launched with “npm run dapp” and is available at http://localhost:8000

> Specific contract calls:

> 1) Passenger can purchase insurance for flight

> 2) Trigger contract to request flight status update

:white_check_mark:

### Oracle Server Application

> A server app has been created for simulating oracle behavior. Server can be launched with “npm run server”

:white_check_mark:

### Operational status control is implemented in contracts

> Students has implemented operational status control.

:white_check_mark:

### Fail Fast Contract

> Contract functions “fail fast” by having a majority of “require()” calls at the beginning of function body

:white_check_mark:

## Airlines

### Airline Contract Initialization

> First airline is registered when contract is deployed.

:white_check_mark:

### Multiparty Consensus

> Only existing airline may register a new airline until there are at least four airlines registered

> Demonstrated either with Truffle test or by making call from client Dapp

:white_check_mark:

### Multiparty Consensus

> Registration of fifth and subsequent airlines requires multi-party consensus of 50% of registered airlines

> Demonstrated either with Truffle test or by making call from client Dapp

:white_check_mark:

### Airline Ante

> Airline can be registered, but does not participate in contract until it submits funding of 10 ether (make sure it is not 10 wei)

> Demonstrated either with Truffle test or by making call from client Dapp

:white_check_mark:

## Passengers

### Passenger Airline Choice

> Passengers can choose from a fixed list of flight numbers and departures that are defined in the Dapp client 

> Your UI implementation should include:

> Fields for Airline Address and Airline Name

> Amount of funds to send/which airline to send to

> Ability to purchase flight insurance for no more than 1 ether

:white_check_mark:

### Passenger Payment

> Passengers may pay up to 1 ether for purchasing flight insurance.

:white_check_mark:

### Passenger Repayment

> If flight is delayed due to airline fault, passenger receives credit of 1.5X the amount they paid

:white_check_mark:

### Passenger Withdraw

> Passenger can withdraw any funds owed to them as a result of receiving credit for insurance payout

### Insurance Payouts

> Insurance payouts are not sent directly to passenger’s wallet

:white_check_mark:

## Oracles (Server App)

### Functioning Oracle

> Oracle functionality is implemented in the server app.

:white_check_mark:

### Oracle Initialization

> Upon startup, 20+ oracles are registered and their assigned indexes are persisted in memory

:white_check_mark:

### Oracle Updates

> Update flight status requests from client Dapp result in OracleRequest event emitted by Smart Contract that is captured by server (displays on console and handled in code)

:white_check_mark:

### Oracle Functionality

> Server will loop through all registered oracles, identify those oracles for which the OracleRequest event applies, and respond by calling into FlightSuretyApp contract with random status code of Unknown (0), On Time (10) or Late Airline (20), Late Weather (30), Late Technical (40), or Late Other (50)

:white_check_mark:


# #######################################

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp scaffolding (using HTML, CSS and JS) and server app scaffolding.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## Develop Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## Develop Server

`npm run server`
`truffle test ./test/oracles.js`

## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)