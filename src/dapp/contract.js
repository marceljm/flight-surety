import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.flightSuretyData = new this.web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.airlinesNames = ['American', 'Emirates', 'Delta', 'JetBlue', 'United'];
        this.flights = [{ "Atlanta": "ATL" }, { "Dallas": "DFW" }, { "Denver": "DEN" }, { "Chicago": "ORD" }, { "Los Angeles": "LAX" }, { "Charlotte": "CLT" }, { "Orlando": "MCO" }, { "Baiyun": "CAN" }, { "Shuangliu": "CTU" }, { "Las Vegas": "LAS" }, { "Phoenix": "PHX" }, { "Miami-Dade County": "MIA" }, { "Delhi": "DEL" }, { "Arnavutköy": "IST" }, { "Bao'an": "SZX" }, { "SeaTac": "SEA" }, { "Venustiano Carranza": "MEX" }, { "Yubei": "CKG" }, { "Changning": "SHA" }, { "Chaoyang": "PEK" }, { "Guandu": "KMG" }, { "Pudong": "PVG" }, { "Houston": "IAH" }, { "Khimki": "SVO" }, { "Queens": "JFK" }, { "Weicheng": "XIY" }, { "Garhoud": "DXB" }, { "Newark": "EWR" }, { "Xiaoshan": "HGH" }, { "Broward County": "FLL" }, { "Roissy-en-France": "CDG" }, { "Ōta": "HND" }, { "Jeju City": "CJU" }, { "Haarlemmermeer": "AMS" }, { "Domodedovo": "DME" }, { "Daxing District": "PKX" }, { "Pendik": "SAW" }, { "Frankfurt": "FRA" }, { "St. Paul": "MSP" }, { "San Mateo County": "SFO" }, { "Guarulhos": "GRU" }, { "Madrid": "MAD" }, { "Detroit": "DTW" }, { "East Boston": "BOS" }, { "Gangseo District": "GMP" }, { "Cancún": "CUN" }, { "Salt Lake City": "SLC" }, { "Antalya": "AYT" }, { "Changsha": "CSX" }, { "Wuhan": "WUH" }];
        this.airlineFlight = {};
        this.passengersNames = ['Elon Musk', 'Jeff Bezos', 'Bernard Arnault', 'Bill Gates', 'Warren Buffett'];
        this.timestamp = Math.floor(Date.now() / 1000);
        this.statusMap = {"0": "Unknown", "10": "On time", "20": "Late: airline", "30": "Late: weather", "40": "Late: technical", "50": "Late: other"};
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];

            let counter = 1;

            while (this.airlines.length < 5) {
                try {
                    let airline = accts[counter];
                    let name = this.airlinesNames[counter - 1];
                    let airlineCode = name.substring(0, 3).toUpperCase();

                    // register airlines
                    this.airlines.push(airline);
                    this.flightSuretyApp.methods.registerAirline(airline, name);
                    console.log(`\nAirline: ${name}`);

                    // register flights
                    this.airlineFlight[name] = [];
                    for (let i = 0; i < this.flights.length; i++) {
                        // "random" distribution of flights among the airlines
                        if (i % (counter + 1) == 0) {
                            let city = Object.keys(this.flights[i])[0];
                            let airportCode = Object.values(this.flights[i])[0];
                            let flightCode = `${airportCode}`;
                            console.log(`Flight: ${city} (${flightCode})`);

                            this.flightSuretyApp.methods.registerFlight(airline, flightCode, this.timestamp);
                            this.airlineFlight[name].push([city, flightCode]);
                        }
                    }
                }
                catch (e) {
                    console.log(e);
                }
                counter++;
            }

            // register passengers
            while (this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }

            callback();
        });
    }

    isOperational(callback) {
        let self = this;
        self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner }, callback);
    }

    fetchFlightStatus(airlineAccount, flight, callback) {
        let self = this;
        let payload = {
            airline: airlineAccount,
            flight: flight,
            timestamp: this.timestamp
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner }, async (error, result) => {
                const body = JSON.stringify({ 'airline': airlineAccount, 'flight': flight, 'timestamp': this.timestamp });
                const res = await fetch('http://localhost:3000/submit-oracle-responses', {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: body
                });
                if (res.ok) {
                    const data = await res.json();
                    let status = data['status'];
                    payload['status'] = self.statusMap[status];
                    console.log(status);
                }
                callback(error, payload);
            });
    }

    buy(airlineAccount, flightCode, timestamp, passengerAccount, funds, callback) {
        let fundsWei = this.web3.utils.toWei(funds, "ether");

        let self = this;

        self.flightSuretyData.methods
            .buy(airlineAccount, flightCode, timestamp)
            .send({ from: passengerAccount, value: fundsWei, gas: 999999 }, (error, result) => {
                console.log(error);
                console.log(result);
            });
    }
}