module.exports = (config) => {
  var module = {};
  const gcloud = require('google-cloud');
  const ds = gcloud.datastore(config);

  console.log("datahub-common, program, Config was " + JSON.stringify(config));

  module.getProgram = (id, cb) => {
      ds.get(ds.key(['Program', id]), cb);
  }

  module.getPrograms = (cb) => {
    var query = ds.createQuery('Program');
    ds.runQuery(query, cb);
  }

  module.getBindings = (cb) => {
    var query = ds.createQuery('Binding');
    ds.runQuery(query, cb);
  }

  module.createBinding = (binding, cb) => {
    ds.save({
      key: ds.key(['Binding']),
      data: binding
    }, cb);
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
