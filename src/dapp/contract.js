import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';

export default class Contract {
    constructor(network, callback) {

        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.airlinesNames = ['American', 'Emirates', 'Delta', 'JetBlue', 'United'];
        this.flights = [{"Atlanta":"ATL"}, {"Dallas":"DFW"}, {"Denver":"DEN"}, {"Chicago":"ORD"}, {"Los Angeles":"LAX"}, {"Charlotte":"CLT"}, {"Orlando":"MCO"}, {"Baiyun":"CAN"}, {"Shuangliu":"CTU"}, {"Las Vegas":"LAS"}, {"Phoenix":"PHX"}, {"Miami-Dade County":"MIA"}, {"Delhi":"DEL"}, {"Arnavutköy":"IST"}, {"Bao'an":"SZX"}, {"SeaTac":"SEA"}, {"Venustiano Carranza":"MEX"}, {"Yubei":"CKG"}, {"Changning":"SHA"}, {"Chaoyang":"PEK"}, {"Guandu":"KMG"}, {"Pudong":"PVG"}, {"Houston":"IAH"}, {"Khimki":"SVO"}, {"Queens":"JFK"}, {"Weicheng":"XIY"}, {"Garhoud":"DXB"}, {"Newark":"EWR"}, {"Xiaoshan":"HGH"}, {"Broward County":"FLL"}, {"Roissy-en-France":"CDG"}, {"Ōta":"HND"}, {"Jeju City":"CJU"}, {"Haarlemmermeer":"AMS"}, {"Domodedovo":"DME"}, {"Daxing District":"PKX"}, {"Pendik":"SAW"}, {"Frankfurt":"FRA"}, {"St. Paul":"MSP"}, {"San Mateo County":"SFO"}, {"Guarulhos":"GRU"}, {"Madrid":"MAD"}, {"Detroit":"DTW"}, {"East Boston":"BOS"}, {"Gangseo District":"GMP"}, {"Cancún":"CUN"}, {"Salt Lake City":"SLC"}, {"Antalya":"AYT"}, {"Changsha":"CSX"}, {"Wuhan":"WUH"}];
        this.airlineFlight = {};
        this.passengersNames = ['Elon Musk', 'Jeff Bezos', 'Bernard Arnault', 'Bill Gates', 'Warren Buffett'];
    }

    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {

            this.owner = accts[0];

            let counter = 1;

            while (this.airlines.length < 5) {                
                try {
                    let airline = accts[counter];
                    let name = this.airlinesNames[counter - 1];

                    // register airlines
                    this.airlines.push(airline);
                    this.flightSuretyApp.methods.registerAirline(airline, name);                    
                    console.log(`\nAirline: ${name}`);
                    
                    // register flights
                    this.airlineFlight[name] = [];
                    for (let i = 0; i < this.flights.length; i++) {
                        // "random" distribution of flights among the airlines
                        if (i % (counter + 1) == 0) {
                            let timestamp = Math.floor(Date.now() / 1000);                            
                            
                            let city = Object.keys(this.flights[i])[0];
                            let code = Object.values(this.flights[i])[0];
                            console.log(`Flight: ${city} (${code})`);
                            
                            this.flightSuretyApp.methods.registerFlight(airline, code, timestamp);
                            this.airlineFlight[name].push([city, code]);
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

    fetchFlightStatus(flight, callback) {
        let self = this;
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        }
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner }, (error, result) => {
                callback(error, payload);
            });
    }
}