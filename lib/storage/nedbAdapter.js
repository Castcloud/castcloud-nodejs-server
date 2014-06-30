var nedb = require('nedb');

var db = {
    users: new nedb({ filename: 'db/users.db', autoload: true }),
    casts: new nedb({ filename: 'db/casts.db', autoload: true }),
    episodes: new nedb({ filename: 'db/episodes.db', autoload: true })
};

db.users.ensureIndex({ fieldName: 'username', unique: true });
db.casts.ensureIndex({ fieldName: 'url' });
db.episodes.ensureIndex({ fieldName: 'castid' });

db.casts.persistence.setAutocompactionInterval(300000);
db.episodes.persistence.setAutocompactionInterval(300000);

module.exports = db;