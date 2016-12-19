module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const ds = gcloud.datastore(config);
	const Subscription = 'Subscription';

	module.getSubscriptions = (usercode, cb) => {
		var query = ds.createQuery(Subscription);
		query.filter('usercode', usercode);
		ds.runQuery(query, cb);
	};

	module.createSubscription = (sub, cb) => {
		// Create a new subscription
		ds.save({
			key: ds.key([Subscription]),
			data: sub
		}, (err) => {
			cb(err);
		});
	};

	module.hasSubscription = (usercode, repocode, cb) => {
		var query = ds.createQuery(Subscription);
		query.filter('usercode', usercode);
		query.filter('repocode', repocode);
		ds.runQuery(query, (err, results) => {
			if (err) {
				return cb(err);
			}
			else {
				return cb(null, results && results.length > 0);
			}
		});
	}
	return module;
}
