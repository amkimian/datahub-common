module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const ds = gcloud.datastore(config);
	const Profile = 'Profile';

	module.getProfile = (code, cb) => {
		var query = ds.createQuery(Profile);
		query.filter('code', code);
		ds.runQuery(query, cb);
	};

	return module;
};
