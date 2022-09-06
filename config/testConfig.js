
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
        "0xf9edcbbec78534b8eac8df2df4c1e9e11650fd8e",
        "0x6b2fd2a840e47ada4742ca255855bbae47b872d3",
        "0x6e68fe380de5f3f17a34ad04b7f97f3d587aa8ca",
        "0x276c6d26a930c580a787f9277050d3e94f96493d",
        "0xa4fd6ff34f72d423db0fa2c72083794510c069bc",
        "0x35f506963926758c93692051a5189c53003c6c2e",
        "0x87924d427961a4f8c70330bc4ed18a8d638a528d",
        "0x8915f19d7034ae1d3556d74c778cd005b758f438",
        "0x77c3d750c163f5afcaa682194e6d40cfcb95b815",
        "0x94ecb7b467f5c378d84f275210381e9dfc065ac5",
        "0xbf1a64e63922435390dda45a636a756c6993f1ec",
        "0x80010a910570585bbc45506e2e43383f12a591a8",
        "0x7a02b445447707b5716182c458fdf431cc0d7c55",
        "0x022f894e357b5f5b84e8b4bdf8d5bc985dc2f3c3",
        "0xcd04b82cd3774fe2c4b9bbf5e514e9a8e0c9b4ce",
        "0x7705b34740f3da07663bca758084940a70cdf1a9",
        "0xc01f700b543c2d914659f25d20bf01db35cbba51",
        "0xce24227f48f2f29a2af87a50156c1a95e8b6da56",
        "0x9ce5dc5e54bff0cb8f33ae21c31ae380b91f8dee",
        "0x9d39bf41b724bb80033eef29bff0ce0177d26d58",
        "0x132179bd5deb9b492a018dededd76659be2aa2bb",
        "0xe736c0cd5e11bed3d3ad5bf1118d18df025db439",
        "0xf722f5be242146743e791ef400c1fa196cbedc51",
        "0xe4999611bdc29e8e564a4823adfd6510205d91b0",
        "0x9accd4a38bef92db78ffaf4f7df08e334bcbcd78",
        "0xdec087ffd106e337264742a69592e3a3c19efe84",
        "0x47ba74ab3c53c4af3a77212d468fff4c9f00f7a5",
        "0x4f09f9ace2d97cde9125a9a8b282f9f329c2f2b5",
        "0xd0c81fa876c2b1a9fc20458f93f83db04752e504",
        "0x8b5cf8194c740a2f19988202cd06f2c79979ba6d",
        "0xd61125217a33d80793e4ea434ea1ab1e756cc1c8",
        "0x822e90d8523ffa08b2eadad0f36ea2394afc3f4a",
        "0xff7482c2a85ae428eb2d3c42e8a39b5189cd224c",
        "0x7080e795f95d77b27cdf2ed8878c296dcf879e8e",
        "0x207a05e9a6a0424a5cae997a4d118fa3756d3bab",
        "0x2b89120bbeb4940078a0cd5514e61b4adb94022f",
        "0x106ffb7e2074e6bcaf84abf45a2b3c8654f6362c",
        "0x4b3376f18137a5ca86bd3b6d8792d6d1644ec1d7",
        "0x66d76d7b891f9c8353883313ba5819bbd1207bed",
        "0x11a41a727467e72ecf082a0cc85781d028f175b5"
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