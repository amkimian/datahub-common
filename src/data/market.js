module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const async = require('async');
	const ds = gcloud.datastore(config);
	const Repository = 'Repository';
	const Profile = 'Profile';
	module.getMarketRepos = (cb) => {
		// Retrieve repos that are eligible for the marketplace
		// Then enrich those repos with owner hashicon information
		var query = ds.createQuery(Repository);
		ds.runQuery(query, (err, repos) => {
			if (err) {
				return cb(err);
			}
			var cached = {};
			async.mapSeries(repos, (entry, cb) => {
				if (cached[entry.owner]) {
					entry.iconhash = cached[entry.owner];
					cb(null, entry);
				}
				else {
					var query = ds.createQuery(Profile);
					query.filter('code', entry.code);
					ds.runQuery(query, (err, profiles) => {
						if (err) {
							cb(err);
						}
						else {
							var hashicon = "1234";
							if (profiles.length > 0) {
								hashicon = profiles[0].iconhash;
							}
							cached[entry.code] = hashicon;
							entry.iconhash = hashicon;
							cb(null, entry);
						}
					});
				}
			}, (err, result) => {
				cb(err, result);
			});
		});
	};

	return module;
}
