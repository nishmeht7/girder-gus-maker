const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');

require('./db');

const app = express();

require('./configure')(app);

app.use('/api', require('./routes'))

app.get('/', function (req, res) {
    res.sendFile(app.get('indexHTMLPath'));
});

app.get('/users', function (req, res) {
    res.sendFile(app.get('indexHTMLPath'));
});

app.get('/levels', function (req, res) {
    res.sendFile(app.get('indexHTMLPath'));
});

app.get('/builder', function (req, res) {
    res.sendFile(app.get('indexHTMLPath'));
});

app.get('/createLevel', function (req, res) {
    res.sendFile(app.get('indexHTMLPath'));
});


app.listen(1337, () => { console.log('Server eavesdropping on 1337') });
