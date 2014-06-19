var nedb = require('nedb');

module.exports = {
    users: new nedb({ filename: 'db/users.db', autoload: true }),
    casts: new nedb({ filename: 'db/casts.db', autoload: true }),
    episodes: new nedb({ filename: 'db/episodes.db', autoload: true })
};