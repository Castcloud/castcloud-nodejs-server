var db;

module.exports = exports = init;

function init(adapter) {
    db = adapter;
}

init.prototype.getCasts = function(done) {
    db.casts.find({}, function(err, casts) {
        renameID(casts);
        done(casts);
    });
};

init.prototype.saveCast = function(cast) {
    db.casts.update({ url: cast.url }, cast, { upsert: true });
};

function renameID(obj) {
    if (obj instanceof Array) {
        obj.forEach(function(item) {
            item.id = item._id;
            delete item._id;
        });
    }
    else {
        obj.id = obj._id;
        delete object._id;
    }
}