module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const async = require('async');
	const ds = gcloud.datastore(config);
	const Repository = 'Repository';
	const Profile = 'Profile';
	module.getMarketRepos = (pageSize, pageCursor, cb) => {
		// Retrieve repos that are eligible for the marketplace
		// Then enrich those repos with owner hashicon information
		var query = ds.createQuery(Repository);
		query.limit(pageSize);
		if (pageCursor && pageCursor != 'undefined') {
			query.start(pageCursor);
		}

		ds.runQuery(query, (err, repos, info) => {
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
					console.log("Entry code is " + entry.owner);
					query.filter('code', entry.owner);
					ds.runQuery(query, (err, profiles) => {
						if (err) {
							cb(err);
						}
						else {
							var hashicon = "9a38a7f9e62c60e17071a94f199b24ee";
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
				cb(err, result, info);
			});
		});
	};

	return module;
}
