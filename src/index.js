module.exports = () => {
  const config = require('./config');
  // Bind config
  var module = {};

  module.dataset = (projectId) => {
    return require('./data/dataset.js')(config.getConfig(projectId));
  };

  module.repo = (projectId) => {
    return require('./data/repo.js')(config.getConfig(projectId));
  }

  module.subscription = (projectId) => {
    return require('./data/subscription.js')(config.getConfig(projectId));
  };

  module.user = (projectId) => {
    return require('./data/user.js')(config.getConfig(projectId));
  };

  module.program = (projectId) => {
    return require('./data/program.js')(config.getConfig(projectId));
  };

  module.pub = (projectId) => {
    return require('./msg/pub.js')(config.getConfig(projectId));
  };

  module.config = require('./data/config');

  return module;
}
