const express    = require('express');
const bodyParser = require('body-parser');
const path       = require('path');


if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
  require('../secrets');
}

require('./db');


const app = express();

const port = process.env.PORT || 1337;

require('./configure')(app);

app.use(require('prerender-node'));

app.get('/phaser/dist/phaser.min.js', function(req, res, next) {
	console.log('i can\'t even');
	res.sendFile(path.normalize(__dirname + './../node_modules/phaser/build/phaser.min.js'));
});

app.use('/api', require('./routes'))

app.get('/*', function (req, res) {
    res.sendFile(app.get('indexHTMLPath'));
});

app.listen(port, () => { console.log('Server eavesdropping on ' + port) });
