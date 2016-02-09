const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');


if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
  require('../secrets');
}

require('./db');


const app = express();

require('./configure')(app);

app.use('/api', require('./routes'))

app.get('/*', function (req, res) {
    res.sendFile(app.get('indexHTMLPath'));
});

app.listen(1337, () => { console.log('Server eavesdropping on 1337') });
