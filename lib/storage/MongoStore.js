var db;

function MongoStore(adapter, user) {
    db = adapter;
    this.user = user;
}

MongoStore.prototype.getUser = function(username, done) {
    db.users.findOne({ username: username }, function(err, user) {
        done(user);
    });
};

MongoStore.prototype.getUserByToken = function(token, done) {
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

MongoStore.prototype.saveUser = function(user) {
    db.users.insert(user, function() {});
};

MongoStore.prototype.getCastByURL = function(url, done) {
    db.casts.findOne({ url: url }, function(err, cast) {
        renameID(cast);
        done(cast);
    });
};

MongoStore.prototype.getCasts = function(done) {
    db.casts.find({ _id: { $in: this.user.subscriptions } }, function(err, casts) {
        renameID(casts);
        done(casts);
    });
};

MongoStore.prototype.getAllCasts = function(done) {
    db.casts.find({}, function(err, casts) {
        renameID(casts);
        done(casts);
    });
};

MongoStore.prototype.updateCast = function(id, data) {
    db.casts.update({ _id: id }, { $set: data });
};

MongoStore.prototype.saveCast = function(cast, done) {
    db.casts.update({ url: cast.url }, cast, { upsert: true }, function(err, n, inserted) {
        if (inserted && done) {
            done(inserted._id);
        }
        else if (done) {
            done(null);
        }
    });
};

MongoStore.prototype.addSubscription = function(castid) {
    db.users.update({ _id: this.user.id }, { $addToSet: { subscriptions: castid } });
};

MongoStore.prototype.getEpisodes = function(castid, done) {
    db.episodes.find({ castid: castid }, function(err, episodes) {
        episodes.forEach(function(episode) {
            delete episode.crawlts;
        });
        renameID(episodes);
        done(episodes);
    });
};

MongoStore.prototype.getEpisodesSince = function(since, done) {
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

MongoStore.prototype.saveEpisode = function(episode) {
    db.episodes.insert(episode);
};

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

module.exports = MongoStore;