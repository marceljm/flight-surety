
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function (accounts) {

    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0x69e40522ecf805de823fde234d3a99e2beb1b4f3",
        "0xe085fa3ac6537173ed845a29e3137d80c451bace",
        "0x5c9b1d6c5e930a9f8d8e8addde1a1130497e93f8",
        "0x3956b43cf142fb78b16adebceee73dfd94b941e5",
        "0x6de3639734843d57c28aeb1f8ac3e14081271e59",
        "0xa5c3ada059e07213b6e02cdcef39ba614d281d99",
        "0x0ea1661879291605737ab3b5c028fdba6231d7e7",
        "0x287d1a326eeff1c37f7778111f1d97f1678e0687",
        "0xa45e93e42b925797d9d3b0fb963fe48041eef097",
        "0x645b41c4740e7e8810099738ae313e867f3b0711",
        "0xd2b2dcc8e93ab18f2bd493c1b11f3e1a95f7088b",
        "0x2709238a7085c7e6a0bfb6026abe76a044ce5239",
        "0xd43f13d9cd313ea50f671652b6ef331e63bede92",
        "0xfa2829ecd86a236fce717781ad230e1e39f5f2b9",
        "0x2c774b28ed9f17017962429ba1d263cb350bb49c",
        "0x62fa0d76bb23078ecadf0789dd5cb487b940c57f",
        "0x1e41298645a61895f1a013625971e626fe37ee03",
        "0xcdcb1f80989bb0835065801af0df42f2e480387e",
        "0xa9ad98a41483fadf32105194949dcfc574b8e7f3",
        "0x574282b335193120c9e9beef23afbd88cf771413",
        "0xf9edcbbec78534b8eac8df2df4c1e9e11650fd8e"
    ];


    let owner = accounts[0];
    let firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.new(firstAirline);
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);


    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};