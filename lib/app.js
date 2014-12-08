var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = module.exports = express();
var auth = require('./middleware/auth');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(auth());

app.use('/account', require('./routes/account'));
app.use('/library/casts', require('./routes/casts'));
app.use('/library', require('./routes/episodes'));
app.use('/library/events', require('./routes/events'));
app.use('/library/labels', require('./routes/labels'));
app.use('/library', require('./routes/opml'));

app.use(function(req, res) {
    res.status(404).send('');
});