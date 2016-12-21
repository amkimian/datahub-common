module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const ds = gcloud.datastore(config);
	const Profile = 'Profile';

	module.getProfile = (code, cb) => {
		var query = ds.createQuery(Profile);
		query.filter('code', code);
		ds.runQuery(query, (err, profiles) => {
			if (err) {
				return cb(err);
			}
			if (profiles.length == 0) {
				return cb(null, null);
			}
			else {
				return cb(null, profiles[0]);
			}
		});
	};

	return module;
};
