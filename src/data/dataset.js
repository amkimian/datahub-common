module.exports = (config) => {
  var module = {};
  const gcloud = require('google-cloud');
  const ds = gcloud.datastore(config);
  const storage = gcloud.storage(config);
  const bq = gcloud.bigquery(config);
  const pub = require('../msg/pub')(config);

  console.log("datahub-common, dataset, Config was " + JSON.stringify(config));

  module.getDataSet = (id, cb) => {
    ds.get(ds.key(['DataSet', id]), cb);
  }

  module.getBucket = (datasetid, cb) => {
    ds.get(ds.key(['DataSet', datasetid]), (err, dataset) => {
      if (err) {
        return cb(err);
      }
      var bucket = storage.bucket(dataset.bucket);
      cb(null, bucket);
    });
  }

  module.streamFile = (datasetid, id, cb) => {
    ds.get(ds.key(['DataSet', datasetid]), (err, dataset) => {
      if (err) {
        return cb(err);
      }
      var bucket = storage.bucket(dataset.bucket);
      var file = bucket.file(id);
      file.getMetadata((err, metadata) => {
        file.download((err, contents) => {
          if (err) {
            cb(err);
          } else {
            cb(null, metadata.contentType, contents);
          }
        });
      });

    });

  }

  module.getFiles = (bucketName, cb) => {
    var bucket = storage.bucket(bucketName);
    bucket.getFiles(cb);
  }

  module.getDataSets = (repocode, cb) => {
    var query = ds.createQuery('DataSet');
    query.filter('repocode', repocode);
    ds.runQuery(query, cb);
  }

  module.getTables = (dataset, cb) => {
    var bqds;
    if (dataset.bqowner) {
      var bqalt = gcloud.bigquery(require('./config').getConfig(dataset.bqowner));
      bqds = bqalt.dataset(dataset.bq);
    } else {
      bqds = bq.dataset(dataset.bq);
    }
    bqds.getTables(cb);
  }

  module.getTable = (datasetName, tableName, cb) => {
    var bqds = bq.dataset(datasetName);
    var table = bqds.table(tableName);
    table.get(cb);
  }

  module.queryTable = (datasetId, tableName, whereClause, cb) => {
  // SELECT * FROM [datahub-151621:amxtestxbq.test] LIMIT 1000
    exports.getDataSet(datasetId, (err, dataset) => {
      var bqowner = process.env.GCLOUD_PROJECTID;
      console.log(JSON.stringify(dataset));
      if (dataset.bqowner) {
        bqowner = dataset.bqowner;
      }
      var query = 'SELECT * FROM [' + bqowner + ':' + dataset.bq + '.' + tableName + ']';
      if (whereClause) {
        query = query + ' WHERE ' + whereClause;
      }
      query = query + ' LIMIT 100';
      bq.query(query, cb);
    });
  }

  module.postTableData = (datasetId, tableName, data, cb) => {
    exports.getDataSet(datasetId, (err, dataset) => {
      var bqds = bq.dataset(dataset.bq);
      var table = bqds.table(tableName);
      table.get((err, table) => {
  // table.metadata.schema.fields
          var fields = table.metadata.schema.fields;
          var lines = data.split('\n');
          var rows = [];
          for(var i=0; i < lines.length; i++) {
            var entries = module.CSVtoArray(lines[i]);
            var row = {};
            for(var j=0; j< fields.length && j < entries.length; j++) {
              row[fields[j].name] = entries[j];
            }
            //console.log("Adding row " + JSON.stringify(row));
            rows.push(row);
          }
          table.insert(rows, (err) => {
            console.log("Error from table insert - " + err);
              cb(err);
          })
      });
    });
  }

  module.createTable = (datasetName, tableName, tableSchema, cb) => {
    var bqds = bq.dataset(datasetName);
    bqds.createTable(tableName, { schema: tableSchema }, cb);
  };

  module.createDataSet = (dataset, cb) => {
    // Does this dataset already exist?
    var query = ds.createQuery('DataSet');
    query.filter('id', dataset.id);
    ds.runQuery(query, (err, datasets) => {
      if (err) {
        return cb(err);
      }
      if (datasets.length != 0) {
        return cb('DataSet already exists');
      }
      // Depending on the type, we need to create some new things
      // need to create a unique bucket for this dataset
      var finalSave = (dataset, cb) => {
        // Now we create
        ds.save({
          key: ds.key(['DataSet', dataset.id]),
          data: dataset
        }, (err) => {
          if (err) {
            cb(err);
          } else {
            pub.eventUpdate(dataset.owner, dataset.repocode, dataset.id, undefined, undefined, 'create', (err) => {
              if (err) {
                cb(err);
              } else {
                cb(null);
              }
            });
          }
        });
      };

      if (dataset.datasetType == 'store') {
        var bucketName = process.env.GCLOUD_PROJECTID + '-' + dataset.id.replace(/[^a-zA-Z0-9]/g,'-').toLowerCase();
        storage.createBucket(bucketName, (err, bucket) => {
          if (err) {
            return cb(err);
          }
          dataset.bucket = bucketName;
          finalSave(dataset, cb);
        });
      } else if (dataset.datasetType == 'bigquery') {
        // Create a dataset on bigquery
        console.log("Creating big query dataset");
        var datasetName = dataset.id.replace(/[^a-zA-Z0-9]/g,'x').toLowerCase();
        var bqds = bq.createDataset(datasetName, (err, ds) => {
          console.log("Create Big Query DataSet Error is " + err);
          dataset.bq = datasetName;
          finalSave(dataset, cb);
        });
      } else {
        finalSave(dataset, cb);
      }

    });

  };

  // Return array of string values, or NULL if CSV string not well formed.
  module.CSVtoArray => (text) {
      var re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
      var re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
      // Return NULL if input string is not well formed CSV string.
      if (!re_valid.test(text)) return null;
      var a = [];                     // Initialize array to receive values.
      text.replace(re_value, // "Walk" the string using replace with callback.
          function(m0, m1, m2, m3) {
              // Remove backslash from \' in single quoted values.
              if      (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
              // Remove backslash from \" in double quoted values.
              else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
              else if (m3 !== undefined) a.push(m3);
              return ''; // Return empty string.
          });
      // Handle special case of empty last value.
      if (/,\s*$/.test(text)) a.push('');
      return a;
  };

  return module;
};
