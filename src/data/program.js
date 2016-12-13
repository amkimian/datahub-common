module.exports = (config) => {
  var module = {};
  const gcloud = require('google-cloud');
  const ds = gcloud.datastore(config);

  console.log("datahub-common, program, Config was " + JSON.stringify(config));

  module.getPrograms = (cb) => {
    var query = ds.createQuery('Program');
    ds.runQuery(query, cb);
  }

  module.createProgram = (program, cb) => {
    var query = ds.createQuery('Program');
    query.filter('id', program.id);
    ds.runQuery(query, (err, programs) => {
      if (err) {
        return cb(err);
      }
      if (programs.length != 0) {
        return cb('Program already exists');
      }
      ds.save({
        key: ds.key(['Program', program.id]),
        data: program
      }, cb);
    });
  };

  return module;
}
