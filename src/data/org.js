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

	module.getUserOrgs = (user, pageSize, pageCursor, cb) => {
		var query = ds.createQuery(OrgMember);
		query.filter('user', user);
		//	query.groupBy('orgcode');
		query.limit(pageSize);
		if (pageCursor && pageCursor != 'undefined') {
			console.log("Setting starting point for pageCursor " + pageCursor);
			query.start(pageCursor);
		}
		ds.runQuery(query, cb);
	}

	module.canEdit = (user, org, cb) => {
		var query = ds.createQuery(OrgMember);
		query.filter('user', user);
		query.filter('orgcode', org);
		console.log("Running canEdit query");
		ds.runQuery(query, (err, members) => {
			if (err) {
				return cb(err);
			}
			console.log("Got members - " + JSON.stringify(members));
			for (var i = 0; i < members.length; i++) {
				if (members[i].role == 'owner' || members[i].role == 'editor') {
					return cb(null, true);
				}
			}
			return cb(null, false);
		});
	}

	return module;
}
