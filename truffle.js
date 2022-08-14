var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
    networks: {
        development: {
            provider: function () {
                return new HDWalletProvider(mnemonic, "http://127.0.0.1:9545/", 0, 50);
            },
            network_id: '*',
            gas: 9999999
        }
        // development: {
        //     host: "127.0.0.1",     // Localhost (default: none)
        //     port: 9545,            // Standard Ethereum port (default: none)
        //     network_id: "*",       // Any network (default: none)
        // }
    },
    compilers: {
        solc: {
            version: "^0.8.0"
        }
    }
};