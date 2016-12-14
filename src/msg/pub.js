module.exports = (config) => {
  var module = {};

  const gcloud = require('google-cloud');
  const pubsub = gcloud.pubsub(config);
  const async = require('async');
  var topicMap = {
    eventUpdate : {
    }
  }

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

  module.eventUpdate = (owner, repo, dataset, element, elementType, change, content, cb) => {
    // Publish update
    var event = {
      owner: owner,
      repo: repo,
      dataset: dataset,
      element: element,
      elementType: elementType,
      change: change,
      content: content,
      when: new Date()
    };
    topicMap.eventUpdate.topic.publish(event, cb);
  };

  module.publishMessage = (topic, message, cb) => {
    var t = pubsub.topic(topic);
    t.get({ autoCreate: true}, (err, top) => {
      top.publish(message, cb);
    });
  };

  return module;
}
