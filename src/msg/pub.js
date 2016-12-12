const gcloud = require('google-cloud');
const config = require('../data/config').getConfig();
const async = require('async');

const pubsub = gcloud.pubsub(config);
var topicMap = {
    eventUpdate : {
    }
}
const topicName = 'eventUpdate';

bindTopics = (() => {
  async.each(Object.keys(topicMap), (topicKey, cb) => {
    var t = pubsub.topic(topicKey);
    t.get({ autoCreate: true}, (err, top) => {
      topicMap[topicKey].topic = top;
      cb(err);
    });
  }, (err) => {
    if (err) {
      console.log("Could not bind topics " + err);
    } else {
      console.log("All topics bound");
    }
  });
});

bindTopics();

exports.eventUpdate = (owner, repo, dataset, element, elementType, change, cb) => {
  // Publish update
  var event = {
    owner: owner,
    repo: repo,
    dataset: dataset,
    element: element,
    elementType: elementType,
    change: change,
    when: new Date()
  };
  topicMap.eventUpdate.topic.publish(event, cb);
};

exports.testMessage = (req, res, next) => {
  exports.eventUpdate('AM', 'QMG', 'HELLO', "XYZ.mpg", 'application/pdf', 'Added', next);
};
