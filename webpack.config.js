/*jshint esversion: 6 */

const webpack = require('webpack');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const devMode = process.env.NODE_ENV !== 'production';

let config = {
    mode: 'development',
    entry: {
        'js/app.js': './src/client/js/app.js',
        'css/style.css': './src/client/scss/app.scss'
    },
    output: {
        path: path.resolve(__dirname, './build/client/app'),
        filename: '[name]'
    },

    module: {
        rules: [
            {
                test: /\.js$/, // files ending with .js
                exclude: /node_modules/, // exclude the node_modules directory
                loader: 'babel-loader' // use this (babel-core) loader
            },
            {
                test: /\.(sa|sc|c)ss$/,
                exclude: /js/,
                use: [
                    {
                        loader: devMode ? MiniCssExtractPlugin.loader : 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            includePaths: ['./src/scss']
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: devMode ? '[name]' : '[name].[hash]'
        })
    ]

};

module.exports = config;
