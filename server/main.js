const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');

const app = express();

// PARSING MIDDLEWARE
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', require('./routes'))

app.listen(1337, () => { console.log('Server eavesdropping on 1337') });
