const webpack = require('webpack')
const path = require('path')
const nodeExternals = require('webpack-node-externals')
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

module.exports = {
    entry: [
        'webpack/hot/poll?1000',
        './src/server/index'
    ],
    watch: true,
    target: 'node',
    externals: [nodeExternals({
        allowlist: ['webpack/hot/poll?1000']
    })],
    module: {
        rules: [{
            test: /\.js?$/,
            use: 'babel-loader',
            exclude: /node_modules/
        }]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                "BUILD_TARGET": JSON.stringify('server')
            }
        }),
        new RunScriptWebpackPlugin({ name: 'server.js', autoRestart: false }),
    ],
    output: {
        path: path.join(__dirname, 'prod/server'),
        filename: 'server.js'
    },
    optimization: {
        moduleIds: 'named'
    }
}