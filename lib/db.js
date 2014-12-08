var conn = require('monk')('localhost/castcloud');
var ObjectID = require('mongodb').ObjectID;
var _ = require('lodash');

var db = {
	users: conn.get('users'),
	casts: conn.get('casts'),
	label: conn.get('labels'),
	episodes: conn.get('episodes'),
	events: conn.get('events'),
	settings: conn.get('settings')
};

db.users.index('username', { unique: true });
db.users.index('clients.token');
db.casts.index('url');
db.episodes.index('castid');

function DB(user) {
    this.user = user;
}

DB.prototype.getUser = function(username, done) {
    db.users.findOne({ username: username }, function(err, user) {
        done(user);
    });
};

DB.prototype.getUserByToken = function(token, done) {
    db.users.findOne({ 
    	clients: { 
    		$elemMatch: { token: token } 
    	} 
    }, function(err, user) {
        renameID(user);
        done(user);
    });
};

DB.prototype.addClient = function(userid, client) {
	db.users.update({ _id: userid }, { $push: { clients: client } });
};

DB.prototype.saveUser = function(user) {
    db.users.insert(user);
};

DB.prototype.getCastByURL = function(url, done) {
    db.casts.findOne({ url: url }, function(err, cast) {
        renameID(cast);
        done(cast);
    });
};

DB.prototype.getCasts = function(done) {
    db.casts.find({ _id: { $in: this.user.subscriptions } }, function(err, casts) {
        renameID(casts);
        done(casts);
    });
};

DB.prototype.getAllCasts = function(done) {
    db.casts.find({}, function(err, casts) {
        renameID(casts);
        done(casts);
    });
};

DB.prototype.updateCast = function(id, data) {
    db.casts.update({ _id: id }, { $set: data });
};

DB.prototype.saveCast = function(cast, done) {
    db.casts.update({ url: cast.url }, cast, { upsert: true }, function(err, n, inserted) {
        if (inserted && done) {
            done(inserted._id);
        }
        else if (done) {
            done(null);
        }
    });
};

DB.prototype.addSubscription = function(castid) {
    db.users.update({ _id: this.user.id }, { $addToSet: { subscriptions: castid } });
};

DB.prototype.removeSubscription = function(castid) {
    db.users.update({ _id: this.user.id }, { $pull: { subscriptions: castid } });
};

DB.prototype.getEpisodes = function(castid, done) {
	// Monk only casts _id
	if (typeof castid === 'string') {
		castid = ObjectID(castid);
	}
    db.episodes.find({ castid: castid }, function(err, episodes) {
        episodes.forEach(function(episode) {
            delete episode.crawlts;
        });
        renameID(episodes);
        done(episodes);
    });
};

DB.prototype.getEpisodesSince = function(since, done) {
    db.episodes.find({ crawlts: { $gt: parseInt(since) }, castid: { $in: this.user.subscriptions } }, function(err, episodes) {
        episodes.forEach(function(episode) {
            delete episode.crawlts;
        });
        renameID(episodes);
        done({
            timestamp: Date.now() / 1000 | 0,
            episodes: episodes
        });
    });
};

DB.prototype.saveEpisode = function(episode) {
    db.episodes.insert(episode);
};

DB.prototype.getEvents = function(since, exclude_self, done) {
	var query = {
		userid: this.user.id,
		clientts: { $gt: parseInt(since) }
	};

	if (exclude_self) {
		query.uuid = { $ne: this.user.uuid };
	}

	db.events.find({ 
        $query: query, 
        $orderby: {
            clientts: -1,
            concurrentorder: -1
        }
    }, function(err, events) {
        _.each(events, function(event) {
        	delete event._id;
        	delete event.uuid;
        });
        done({
            timestamp: Date.now() / 1000 | 0,
            events: events
        });
    });
};

DB.prototype.addEvents = function(events) {
	var userid = this.user.id;
	var uuid = this.user.uuid;
	_.each(events, function(event) {
		event.userid = userid;
		event.uuid = uuid;
	});
    db.events.insert(events);
};

function renameID(obj) {
    if (obj instanceof Array) {
        _.each(obj, function(item) {
            item.id = item._id;
            delete item._id;
        });
    }
    else if (obj) {
        obj.id = obj._id;
        delete obj._id;
    }
}

module.exports = DB;