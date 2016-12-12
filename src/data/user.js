const gcloud = require('google-cloud');
const config = require('./config').getConfig();

const ds = gcloud.datastore(config);

// Code to manage users (usually on gcloud)

exports.getUserByKey = (key, cb) => {
    ds.get(ds.key(['User', key]), (err, user) => {
      cb(err, user);
    });
}

exports.getUserById = (id, cb) => {
  var query = ds.createQuery('User');
  query.filter('id', id);
  ds.runQuery(query, (err, users) => {
    if (err) { return cb(err); }
    if (users) {
      if (users.length == 1) {
        var user = users[0];
        cb(err, user);
      } else if (users.length == 0) {
        cb(null, null);
      } else {
        cb('Too many matches', null);
      }
    } else {
      cb(null, null);
    }
  });
}

exports.getUserByEmail = (email, cb) => {
  var query = ds.createQuery('User');
  query.filter('email', email);
  ds.runQuery(query, (err, users) => {
    if (err) { return cb(err); }
    if (users) {
      if (users.length == 1) {
        var user = users[0];
        cb(err, user);
      } else if (users.length == 0) {
        cb(null, null);
      } else {
        cb('Too many matches', null);
      }
    } else {
      cb(null, null);
    }
  });
}

exports.getUserByTag = (tagName, tagValue, cb) => {
  var query = ds.createQuery('User');
  query.filter(tagName, tagValue);
  ds.runQuery(query, (err, users) => {
    if (err) { return cb(err); }
    if (users) {
      if (users.length == 1) {
        var user = users[0];
        cb(err, user);
      } else if (users.length == 0) {
        cb(null, null);
      } else {
        cb('Too many matches', null);
      }
    } else {
      cb(null, null);
    }
  });
}

exports.saveUser = (id, user, cb) => {
  ds.save( {
    key: ds.key(['User', id]),
    data: user
  }, (err) => {
    cb(err);
  });
}

exports.checkCodeFree = (code, cb) => {
  var query = ds.createQuery('User');
  query.filter('code', code);
  ds.runQuery(query, (err, users) => {
    cb(err, users.length == 0);
  });
}
