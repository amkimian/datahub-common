module.exports = () => {
  // Bind config
  var module = {};
  module.getConfig = (projectId) => {
    if (!projectId) {
      projectId = process.env.GCLOUD_PROJECTID;
    }
    var config ={
        projectId: projectId
    };

    if (process.env.CLOUD == 0) {
      config.keyFilename = process.env.GCLOUD_CONFIGKEY;
    }
    return config;
  };

  module.dataset = (projectId) => {
    return require('./data/dataset.js')(module.getConfig(projectId));
  };

  module.repo = (projectId) => {
    return require('./data/repo.js')(module.getConfig(projectId));
  }

  module.subscription = (projectId) => {
    return require('./data/subscription.js')(module.getConfig(projectId));
  };

  module.user = (projectId) => {
    return require('./data/user.js')(module.getConfig(projectId));
  };

  module.program = (projectId) => {
    return require('./data/program.js')(module.getConfig(projectId));
  };

  return module;
}
