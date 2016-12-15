module.exports = (config) => {
  var module = {};
  const gcloud = require('google-cloud');
  const ds = gcloud.datastore(config);
  const Repository = 'Repository';

  module.getRepositories = (userid, cb) => {
    var query = ds.createQuery(Repository);
    query.filter('owner', userid);
    ds.runQuery(query, cb);
  };

  module.getRepositoryByCode = (repocode, cb) => {
    var query = ds.createQuery(Repository);
    query.filter('repocode', repocode);
    ds.runQuery(query, (err, repos) => {
      if (err) { return cb(err); }
      if (repos) {
        if (repos.length == 0) {
          return cb(err, null);
        } else if (repos.length == 1) {
          return cb(err, repos[0]);
        } else {
        return cb('Too Many');
        }
      } else {
        return cb(err, null);
      }
    });
  };

  module.createRepository = (repo, cb) => {
      module.getRepositoryByCode(repo.repocode, (err, r) => {
          if (err) { return cb(err); }
          if (r != null) {
            return cb('Already exists');
          } else {
            module.updateRepository(repo, cb);
          }
      });
  };

  module.updateRepository = (repo, cb) => {
    // What is the key?
    console.log("Saving repo");
    ds.save( {
      key: ds.key(['Repository', repo.repocode]),
      data: repo
    }, (err) => {
      cb(err);
    });
  };

  module.deleteRepository = (repocode, cb) => {
    ds.delete(ds.key([Repository, repocode]), (err) => {
      cb(err);
    })
  };

  return module;
}
