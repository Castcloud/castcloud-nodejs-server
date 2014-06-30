var db;

module.exports = exports = init;

function init(adapter, user) {
    db = adapter;
    this.user = user;
}

init.prototype.getUserByToken = function(token, done) {
    db.users.findOne({ $where: function() {
        var found = false;
        this.auth.forEach(function(a) {
            if (a.token == token) {
                found = true;
            }
        });
        return found;
    }}, function(err, user) {
        renameID(user);
        done(user);
    });
};

init.prototype.saveUser = function(user) {
    db.users.insert(user);
};

init.prototype.getCastByURL = function(url, done) {
    db.casts.findOne({ url: url }, function(err, cast) {
        renameID(cast);
        done(cast);
    });
};

init.prototype.getCasts = function(done) {
    db.casts.find({ _id: { $in: this.user.subscriptions } }, function(err, casts) {
        renameID(casts);
        done(casts);
    });
};

init.prototype.getAllCasts = function(done) {
    db.casts.find({}, function(err, casts) {
        renameID(casts);
        done(casts);
    });
};

init.prototype.saveCast = function(cast, done) {
    db.casts.update({ url: cast.url }, cast, { upsert: true }, function(err, n, inserted) {
        if (inserted && done) {
            done(inserted._id);
        }
        else if (done) {
            done(null);
        }
    });
};

init.prototype.addSubscription = function(castid) {
    db.users.update({ _id: this.user.id }, { $addToSet: { subscriptions: castid } });
};

init.prototype.getEpisodes = function(castid, done) {
    db.episodes.find({ castid: castid }, function(err, episodes) {
        episodes.forEach(function(episode) {
            delete episode.crawlts;
        });
        renameID(episodes);
        done(episodes);
    });
};

init.prototype.getEpisodesSince = function(since, done) {
    db.episodes.find({ crawlts: { $gt: since }, castid: { $in: this.user.subscriptions } }, function(err, episodes) {
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

init.prototype.saveEpisode = function(episode) {
    db.episodes.update({ castid: episode.castid, 'feed.guid': episode.feed.guid }, episode, { upsert: true });
}

function renameID(obj) {
    if (obj instanceof Array) {
        obj.forEach(function(item) {
            item.id = item._id;
            delete item._id;
        });
    }
    else if (obj) {
        obj.id = obj._id;
        delete obj._id;
    }
}