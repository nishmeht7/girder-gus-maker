'use strict';
const Promise = require('bluebird');
const path = require('path');
const chalk = require('chalk');

var mongoose = require('mongoose');
const db = mongoose.connect('mongodb://gus:gusIsGreat@ds051655.mongolab.com:51655/ggmng').connection;

// Require our models -- these should register the model into mongoose
// so the rest of the application can simply call mongoose.model('User')
// anywhere the User model needs to be used.
require('./models');

const startDbPromise = new Promise(function (resolve, reject) {
    db.on('open', resolve);
    db.on('error', reject);
});

console.log(chalk.yellow('Opening connection to MongoDB . . .'));
startDbPromise.then(function () {
    console.log(chalk.green('MongoDB connection opened!'));
});

module.exports = startDbPromise;
