var _ = require('lodash');
var app = require('../app');
var DB = require('../db');

function auth() {
	return function(req, res, next) {
	    if (req.path !== '/account/login') {
	        var token = req.headers.authorization;
	        app.db.getUserByToken(token, function(user) {
	            if (user) {
	                var client = _.find(user.clients, { token: token });
	                user.uuid = client.uuid;

	                req.db = new DB(user);
	                req.user = user;
	                next();
	            }
	            else {
	                res.sendStatus(401);
	            }
	        });
	    }
	    else {
	        next();
	    }
	};
}

module.exports = auth;