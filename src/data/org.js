module.exports = (config) => {
	var module = {};
	const gcloud = require('google-cloud');
	const ds = gcloud.datastore(config);
	const Org = 'Org';
	const OrgMember = 'OrgMember';

	module.createOrg = (orgcode, desc, owner, cb) => {
		// Check to see if this org exists or not

		var query = ds.createQuery(Org);
		query.filter('orgcode', orgcode);
		ds.runQuery(query, (err, org) => {
			if (err) {
				return cb(err);
			}
			if (org.length != 0) {
				return cb('An organization already exists with that code');
			}
			var orgData = {
				orgcode: orgcode,
				description: desc
			};
			ds.save({
				key: ds.key([Org, orgcode]),
				data: orgData
			}, (err, org) => {
				if (err) {
					cb(err);
				}
				else {
					// Now save the owner membership
					var membership = {
						orgcode: orgcode,
						user: owner,
						role: 'owner'
					};
					ds.save({
						key: ds.key([OrgMember]),
						data: membership
					}, cb);
				}
			});
		});
	};

	return module;
}
