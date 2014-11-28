var _db = require('monk')('localhost/castcloud');

var db = {
	users: _db.get('users'),
	casts: _db.get('casts'),
	episodes: _db.get('episodes')
};

db.users.index('username', { unique: true });
db.casts.index('url');
db.episodes.index('castid');

module.exports = db;