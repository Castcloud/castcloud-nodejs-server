var express = require('express');
var _ = require('lodash');
var bcrypt = require('bcrypt');
var crypto = require('crypto');
var app = require('../app');
var router = express.Router();

function generateToken(len, cb) {
	crypto.randomBytes(len, function(err, buffer) {
		cb(buffer.toString('hex'));
	});
}

router.post('/login', function(req, res) {
	if (!req.body.password || 
		!req.body.uuid || 
		!req.body.clientname) {
		res.sendStatus(400);
		return;
	}
	
	app.db.getUser(req.body.username, function(user) {		
		bcrypt.compare(req.body.password, user.password, function(err, correct) {
			if (correct) {
				var client = _.find(user.clients, { uuid: req.body.uuid });
				if (client) {
					res.send({ token: client.token });
				}
				else {
					generateToken(32, function(token) {
						app.db.addClient(user._id, {
							token: token,
							uuid: req.body.uuid,
							clientname: req.body.clientname
						});
						res.send({ token: token });
					});					
				}
			}
			else {
				res.sendStatus(401);
			}
		});			
	});
});

router.get('/ping', function(req, res) {
    res.send();
});

router.get('/settings', function(req, res) {
    res.send();
});

router.post('/settings', function(req, res) {
    res.send();
});

router.delete('/settings/:id', function(req, res) {
    res.send();
});

router.get('/takeout', function(req, res) {
    res.send();
});

module.exports = router;