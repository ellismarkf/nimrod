var path = require('path');
var webpack = require('webpack');
module.exports = {
    entry: [
        './src/js/main'
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'nimrod-compiled.js',
        publicPath: '/static/'
    },
    plugins: [
        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': JSON.stringify('production')
            }
        }),
        new webpack.optimize.UglifyJsPlugin({
            compressor: {
                warnings: false
            }
        })
    ],
    module: {
        loaders: [{
            test: /\.js$/,
            loaders: ['babel'],
            include: path.join(__dirname, 'src')
        }, {
            test: /\.less$/,
            loaders: ['style', 'css', 'less']
        }]
    }
};