module.exports = (config) => {
  var module = {};
  const gcloud = require('google-cloud');
  const ds = gcloud.datastore(config);
  const Event = 'Event';

  module.getEvents = (userid, pageSize, pageCursor, cb) => {
    var query = ds.createQuery(Event);
    query.limit(pageSize);
    if (pageCursor && pageCursor != 'undefined') {
      console.log("Setting starting point for pageCursor " + pageCursor);
      query.start(pageCursor);
    }
    ds.runQuery(query, (err, events, info) => {
      cb(err, event, info );
    });
  };

  return module;
}