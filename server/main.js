const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(1337, () => { console.log('Server eavesdropping on 1337') });
