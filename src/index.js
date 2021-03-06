module.exports = () => {
	// Bind config
	var module = {};
	module.config = require('./data/config.js');

	module.dataset = (projectId) => {
		return require('./data/dataset.js')(module.config.getConfig(projectId));
	};

	module.repo = (projectId) => {
		return require('./data/repo.js')(module.config.getConfig(projectId));
	};

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

	module.event = (projectId) => {
		return require('./data/event.js')(module.config.getConfig(projectId));
	};

	module.org = (projectId) => {
		return require('./data/org.js')(module.config.getConfig(projectId));
	};

	module.profile = (projectId) => {
		return require('./data/profile.js')(module.config.getConfig(projectId));
	};

	module.market = (projectId) => {
		return require('./data/market.js')(module.config.getConfig(projectId));
	};

	return module;
}
