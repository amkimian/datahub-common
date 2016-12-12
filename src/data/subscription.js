const gcloud = require('google-cloud');
var config = require('./config').getConfig();
config.prefix = 'express-sessions';

const ds = gcloud.datastore(config);

exports.getSubscriptions = (usercode, cb) => {
  var query = ds.createQuery('Subscription');
  query.filter('usercode', usercode);
  ds.runQuery(query, cb);
};

exports.createSubscription = (sub, cb) => {
  // Create a new subscription
  ds.save( {
    key: ds.key(['Subscription']),
    data: sub
  }, (err) => {
    cb(err);
  });
}
