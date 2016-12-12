
exports.getConfig = (projectId) => {
  if (!projectId) {
    projectId = process.env.GCLOUD_PROJECTID;
  }
  var config ={
      projectId: projectId
  };

  if (process.env.CLOUD == 0) {
    config.keyFilename = process.env.GCLOUD_CONFIGKEY;
  }
  return config;
};
