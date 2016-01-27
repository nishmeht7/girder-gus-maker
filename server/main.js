const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');

require('./db');

const app = express();

require('./configure')(app);

app.get('/*', function (req, res) {
    res.sendFile(app.get('indexPath'));
});

app.use('/api', require('./routes'))

app.listen(1337, () => { console.log('Server eavesdropping on 1337') });
