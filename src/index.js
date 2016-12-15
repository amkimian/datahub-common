module.exports = () => {
  // Bind config
  var module = {};
  module.config = require('./data/config.js');

  module.dataset = (projectId) => {
    return require('./data/dataset.js')(module.config.getConfig(projectId));
  };

  module.repo = (projectId) => {
    return require('./data/repo.js')(module.config.getConfig(projectId));
  }

  module.subscription = (projectId) => {
    return require('./data/subscription.js')(module.config.getConfig(projectId));
  };

  module.user = (projectId) => {
    return require('./data/user.js')(module.config.getConfig(projectId));
  };

  module.program = (projectId) => {
    return require('./data/program.js')(module.config.getConfig(projectId));
  };

  module.pub = (projectId) => {
    return require('./msg/pub.js')(module.config.getConfig(projectId));
  };


  return module;
}
